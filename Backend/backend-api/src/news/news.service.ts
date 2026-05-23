import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
}
