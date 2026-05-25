import { Controller, Post, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle/:postId')
  toggleLike(@Request() req, @Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.toggleLike(req.user.userId, postId);
  }

  @Get('post/:postId')
  getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.getPostLikes(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:postId')
  checkLike(@Request() req, @Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.checkLike(req.user.userId, postId);
  }
}
