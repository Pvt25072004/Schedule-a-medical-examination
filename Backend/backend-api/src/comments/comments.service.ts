import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const { post_id, parent_id, content } = createCommentDto;
    const post = await this.postRepository.findOne({ where: { id: post_id } });
    if (!post) throw new NotFoundException('Post not found');

    if (parent_id) {
      const parent = await this.commentRepository.findOne({ where: { id: parent_id } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const comment = this.commentRepository.create({
      user_id: userId,
      post_id,
      parent_id,
      content,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Increment comments_count on Post
    post.comments_count = (Number(post.comments_count) || 0) + 1;
    await this.postRepository.save(post);
    
    // Fetch with user info to return complete data
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async getPostComments(postId: number) {
    const comments = await this.commentRepository.find({
      where: { post_id: postId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
    return comments;
  }
}
