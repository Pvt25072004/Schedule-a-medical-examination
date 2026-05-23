import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SocialPost } from './entities/social-post.entity';
import { SocialLike } from './entities/social-like.entity';
import { SocialComment } from './entities/social-comment.entity';
import { CreateSocialPostDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';
import { CreateSocialCommentDto } from './dto/create-social-comment.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialPost)
    private readonly postRepository: Repository<SocialPost>,

    @InjectRepository(SocialLike)
    private readonly likeRepository: Repository<SocialLike>,

    @InjectRepository(SocialComment)
    private readonly commentRepository: Repository<SocialComment>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createHospitalPost(
    dto: CreateSocialPostDto,
    hospitalId: number,
  ): Promise<SocialPost> {
    const post = this.postRepository.create({
      title: dto.title,
      content: dto.content || null,
      image_url: dto.image_url || null,
      image_public_id: dto.image_public_id || null,
      is_active: dto.is_active ?? true,
      hospital_id: hospitalId,
    });

    return this.postRepository.save(post);
  }

  async findHospitalPosts(hospitalId: number): Promise<SocialPost[]> {
    return this.postRepository.find({
      where: {
        hospital_id: hospitalId,
      },
      relations: ['hospital'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async updateHospitalPost(
    id: number,
    dto: UpdateSocialPostDto,
    hospitalId: number,
  ): Promise<SocialPost> {
    const post = await this.postRepository.findOne({
      where: {
        id,
        hospital_id: hospitalId,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    const oldImagePublicId = post.image_public_id;

    Object.assign(post, {
      title: dto.title ?? post.title,
      content: dto.content ?? post.content,
      image_url: dto.image_url ?? post.image_url,
      image_public_id: dto.image_public_id ?? post.image_public_id,
      is_active: dto.is_active ?? post.is_active,
    });

    const savedPost = await this.postRepository.save(post);

    if (
      dto.image_public_id &&
      oldImagePublicId &&
      oldImagePublicId !== dto.image_public_id
    ) {
      await this.cloudinaryService.deleteImage(oldImagePublicId);
    }

    return savedPost;
  }

  async removeHospitalPost(
    id: number,
    hospitalId: number,
  ): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({
      where: {
        id,
        hospital_id: hospitalId,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    if (post.image_public_id) {
      await this.cloudinaryService.deleteImage(post.image_public_id);
    }

    await this.postRepository.remove(post);

    return {
      message: 'Xóa bài đăng thành công',
    };
  }

  async findPublicPosts(): Promise<SocialPost[]> {
    return this.postRepository.find({
      where: {
        is_active: true,
      },
      relations: ['hospital'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findPublicPost(id: number): Promise<SocialPost> {
    const post = await this.postRepository.findOne({
      where: {
        id,
        is_active: true,
      },
      relations: ['hospital'],
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    return post;
  }

  async toggleLike(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean; like_count: number }> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        is_active: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        post_id: postId,
        user_id: userId,
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);

      post.like_count = Math.max(0, post.like_count - 1);
      await this.postRepository.save(post);

      return {
        liked: false,
        like_count: post.like_count,
      };
    }

    const like = this.likeRepository.create({
      post_id: postId,
      user_id: userId,
    });

    await this.likeRepository.save(like);

    post.like_count += 1;
    await this.postRepository.save(post);

    return {
      liked: true,
      like_count: post.like_count,
    };
  }

  async createComment(
    postId: number,
    userId: number,
    dto: CreateSocialCommentDto,
  ): Promise<SocialComment> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        is_active: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    const comment = this.commentRepository.create({
      post_id: postId,
      user_id: userId,
      content: dto.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    post.comment_count += 1;
    await this.postRepository.save(post);

    return savedComment;
  }

  async getComments(postId: number): Promise<SocialComment[]> {
    return this.commentRepository.find({
      where: {
        post_id: postId,
      },
      relations: ['user'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async sharePost(postId: number): Promise<{ share_count: number }> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        is_active: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài đăng');
    }

    post.share_count += 1;
    await this.postRepository.save(post);

    return {
      share_count: post.share_count,
    };
  }
}
