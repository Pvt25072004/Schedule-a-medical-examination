import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(ThrottlerGuard)
  @Post('chat')
  async chat(@Body() body: { messages: any[]; bookingData: any }) {
    return this.aiService.processChat(body.messages, body.bookingData);
  }
}
