import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './schemas/notification.schema';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async createNotification(
    @Body() body: { userId: string; message: string },
  ): Promise<Notification> {
    return this.notificationService.createNotification(
      body.userId,
      body.message,
    );
  }

  @Get(':userId')
  async getNotificationsForUser(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }
}
