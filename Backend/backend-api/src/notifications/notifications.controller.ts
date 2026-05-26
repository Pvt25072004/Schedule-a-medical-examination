import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Tạo thông báo mới (Hệ thống / Cá nhân)' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách thông báo của user (bao gồm thông báo hệ thống) có phân trang' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20; // Giới hạn mặc định 20 bản ghi mới nhất
    return this.notificationsService.findByUser(+userId, p, l);
  }

  @Patch('/:id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo đã đọc' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('/user/:userId/read-all')
  @ApiOperation({ summary: 'Đánh dấu toàn bộ thông báo của user đã đọc' })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(+userId);
  }
}
