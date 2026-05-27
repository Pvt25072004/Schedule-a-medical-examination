import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { messages: any[]; bookingData: any }) {
    return this.aiService.processChat(body.messages, body.bookingData);
  }
}
