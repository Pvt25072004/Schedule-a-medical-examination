import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Hospital } from 'src/hospitals/entities/hospital.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const hospital = await this.hospitalRepository.findOne({
      where: { id: createPostDto.hospital_id },
    });

    if (!hospital) {
      throw new NotFoundException('Không tìm thấy Bệnh viện');
    }

    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['hospital'],
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
      relations: ['hospital'],
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy Bài viết');
    }

    return post;
  }

  async findByHospitalId(hospital_id: number, page: number = 1, limit: number = 10) {
    const hospital = await this.hospitalRepository.findOne({
      where: { id: hospital_id },
    });

    if (!hospital) {
      throw new NotFoundException('Không tìm thấy Bệnh viện');
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository.findAndCount({
      where: { hospital_id },
      relations: ['hospital'],
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
    
    const oldImagePublicId = post.image_public_id;

    const updated = Object.assign(post, updatePostDto);
    const saved = await this.postRepository.save(updated);

    if (
      updatePostDto.image_public_id &&
      oldImagePublicId &&
      oldImagePublicId !== updatePostDto.image_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldImagePublicId);
    }

    return saved;
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
    
    if (post.image_public_id) {
      await this.cloudinaryService.deleteImage(post.image_public_id);
    }

    await this.postRepository.remove(post);
  }
}
