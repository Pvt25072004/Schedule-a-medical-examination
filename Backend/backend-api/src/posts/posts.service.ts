import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Fanpage } from 'src/fanpages/entities/fanpage.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Fanpage)
    private readonly fanpageRepository: Repository<Fanpage>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const fanpage = await this.fanpageRepository.findOne({
      where: { id: createPostDto.fanpage_id },
    });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy Fanpage');
    }

    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['fanpage', 'fanpage.hospital'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['fanpage', 'fanpage.hospital'],
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy Bài viết');
    }

    return post;
  }

  async findByFanpageId(fanpage_id: number, page: number = 1, limit: number = 10) {
    const fanpage = await this.fanpageRepository.findOne({
      where: { id: fanpage_id },
    });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy Fanpage');
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository.findAndCount({
      where: { fanpage_id },
      relations: ['fanpage', 'fanpage.hospital'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    const updated = Object.assign(post, updatePostDto);
    return this.postRepository.save(updated);
  }

  async sharePost(id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.shares_count = (Number(post.shares_count) || 0) + 1;
    await this.postRepository.save(post);
    return { shares_count: post.shares_count };
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }
}
