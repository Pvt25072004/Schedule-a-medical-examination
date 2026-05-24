import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async toggleLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existingLike = await this.likeRepository.findOne({
      where: { user_id: userId, post_id: postId },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      post.likes_count = Math.max(0, post.likes_count - 1);
      await this.postRepository.save(post);
      return { liked: false, likes_count: post.likes_count };
    } else {
      const newLike = this.likeRepository.create({ user_id: userId, post_id: postId });
      await this.likeRepository.save(newLike);
      post.likes_count += 1;
      await this.postRepository.save(post);
      return { liked: true, likes_count: post.likes_count };
    }
  }

  async getPostLikes(postId: number) {
    const likes = await this.likeRepository.find({
      where: { post_id: postId },
      relations: ['user'],
    });
    return likes;
  }

  async checkLike(userId: number, postId: number) {
    const existingLike = await this.likeRepository.findOne({
      where: { user_id: userId, post_id: postId },
    });
    return { is_liked: !!existingLike };
  }
}
