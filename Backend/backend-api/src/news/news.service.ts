import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import Parser from 'rss-parser';
import * as he from 'he';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Hospital } from 'src/hospitals/entities/hospital.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly parser = new Parser();

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,

    private readonly cloudinaryService: CloudinaryService,
  ) { }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async generateUniqueSlug(
    titleOrSlug: string,
    ignoreId?: number,
  ): Promise<string> {
    const baseSlug = this.generateSlug(titleOrSlug);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query = this.newsRepository
        .createQueryBuilder('news')
        .where('news.slug = :slug', { slug });

      if (ignoreId) {
        query.andWhere('news.id != :ignoreId', { ignoreId });
      }

      const existed = await query.getOne();

      if (!existed) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreateNewsDto): Promise<News> {
    const slug = await this.generateUniqueSlug(dto.slug || dto.title);

    const news = this.newsRepository.create({
      title: dto.title,
      slug,
      summary: dto.summary || null,
      content: dto.content,
      image_url: dto.image_url || null,
      image_public_id: dto.image_public_id || null,
      source: dto.source || null,
      author: dto.author || null,
      is_published: dto.is_published ?? true,
      published_at: dto.published_at ? new Date(dto.published_at) : new Date(),
    });

    return this.newsRepository.save(news);
  }

  async findAllAdmin(): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['hospital'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOneAdmin(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['hospital'],
    });

    if (!news) {
      throw new NotFoundException(`Không tìm thấy tin tức với ID ${id}`);
    }

    return news;
  }

  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findOneAdmin(id);
    const oldImagePublicId = news.image_public_id;

    if (dto.slug) {
      news.slug = await this.generateUniqueSlug(dto.slug, id);
    }

    if (dto.title !== undefined) news.title = dto.title;
    if (dto.summary !== undefined) news.summary = dto.summary || null;
    if (dto.content !== undefined) news.content = dto.content;
    if (dto.image_url !== undefined) news.image_url = dto.image_url || null;
    if (dto.image_public_id !== undefined) {
      news.image_public_id = dto.image_public_id || null;
    }
    if (dto.source !== undefined) news.source = dto.source || null;
    if (dto.author !== undefined) news.author = dto.author || null;
    if (dto.is_published !== undefined) news.is_published = dto.is_published;
    if (dto.published_at !== undefined) {
      news.published_at = dto.published_at ? new Date(dto.published_at) : null;
    }

    const savedNews = await this.newsRepository.save(news);

    if (
      dto.image_public_id &&
      oldImagePublicId &&
      oldImagePublicId !== dto.image_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldImagePublicId);
    }

    return savedNews;
  }

  async remove(id: number): Promise<{ message: string }> {
    const news = await this.findOneAdmin(id);

    if (news.image_public_id) {
      await this.cloudinaryService.deleteImage(news.image_public_id);
    }

    await this.newsRepository.remove(news);

    return {
      message: 'Xóa tin tức thành công',
    };
  }

  async findPublicNews(): Promise<News[]> {
    return this.newsRepository.find({
      where: {
        is_published: true,
      },
      order: {
        published_at: 'DESC',
        created_at: 'DESC',
      },
      take: 60, // Giới hạn lấy 60 bài báo mới nhất để tránh quá tải
    });
  }

  async findBySlug(slug: string): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: {
        slug,
        is_published: true,
      },
      relations: ['hospital'],
    });

    if (!news) {
      throw new NotFoundException('Không tìm thấy tin tức');
    }

    news.view_count += 1;
    await this.newsRepository.save(news);

    return news;
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCronSync() {
    this.logger.log('Bắt đầu đồng bộ tin tức định kỳ từ Google News...');
    await this.syncFromGoogleNews();
  }

  async syncFromGoogleNews() {
    try {
      this.logger.log(`Bắt đầu đồng bộ tin tức Y tế từ các báo chính thống...`);

      // Sử dụng RSS trực tiếp từ các báo lớn chuyên mục Sức Khỏe để lấy được ảnh thật
      const rssUrls = [
        'https://tuoitre.vn/rss/suc-khoe.rss',
        'https://vnexpress.net/rss/suc-khoe.rss',
        'https://thanhnien.vn/rss/suc-khoe.rss',
      ];

      let newCount = 0;
      const defaultImageUrl = 'https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te';

      for (const url of rssUrls) {
        try {
          const feed = await this.parser.parseURL(url);
          for (const item of feed.items) {
            // Kiểm tra bài viết đã tồn tại chưa bằng link (source)
            const exists = await this.newsRepository.findOne({
              where: { source: item.link },
            });

            if (!exists) {
              // Ưu tiên lấy ảnh từ enclosure (Tuổi Trẻ) hoặc từ content (VnExpress)
              let imageUrl = defaultImageUrl;
              if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
              } else if (item.content && item.content.includes('<img')) {
                const imgMatch = item.content.match(/src="([^"]+)"/);
                if (imgMatch && imgMatch[1]) {
                  imageUrl = imgMatch[1];
                }
              }

              // Decode HTML entities
              const rawTitle = item.title || 'Tin y tế tổng hợp';
              const decodedTitle = he.decode(rawTitle);
              const safeTitle = decodedTitle.substring(0, 250);
              const slug = await this.generateUniqueSlug(safeTitle);

              let summary = item.contentSnippet ? item.contentSnippet.substring(0, 500) : null;
              // Xóa các text rác từ RSS và decode entity
              if (summary) {
                summary = summary.replace(/<[^>]+>/g, '').trim();
                summary = he.decode(summary);
              }

              const news = this.newsRepository.create({
                title: safeTitle,
                slug: slug.substring(0, 250),
                summary: summary,
                content: he.decode(item.content || item.contentSnippet || 'Nội dung đang được cập nhật...'),
                source: item.link,
                author: item.creator || feed.title || 'Báo điện tử',
                image_url: imageUrl,
                is_published: true,
                published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
              });

              await this.newsRepository.save(news);
              newCount++;
            }
          }
        } catch (feedError) {
          this.logger.error(`Lỗi khi đọc RSS từ ${url}: ${feedError.message}`);
          // Tiếp tục với báo khác
        }
      }

      // Tự động dọn dẹp các bài báo cũ hơn 30 ngày để tránh phình database
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const deleteResult = await this.newsRepository
        .createQueryBuilder()
        .delete()
        .from(News)
        .where('published_at < :date', { date: thirtyDaysAgo })
        .execute();

      const deletedCount = deleteResult.affected || 0;
      this.logger.log(`Đồng bộ thành công. Đã thêm ${newCount} bài báo mới. Đã dọn dẹp ${deletedCount} bài cũ.`);
      return { message: 'Đồng bộ và dọn dẹp tin tức thành công', count: newCount, deleted: deletedCount };

    } catch (error) {
      this.logger.error(`Lỗi khi đồng bộ Google News: ${error.message}`, error.stack);
      throw error;
    }
  }
}
