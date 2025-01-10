import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EmailService } from './email.service';
import { Email } from './schemas/email.schema';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { recipient: string; subject: string; body: string },
  ): Promise<Email> {
    return this.emailService.sendEmail(body.recipient, body.subject, body.body);
  }

  @Get('all')
  async getAllEmails(): Promise<Email[]> {
    return this.emailService.getAllEmails();
  }

  @Get(':id')
  async getEmailById(@Param('id') id: string): Promise<Email> {
    return this.emailService.getEmailById(id);
  }
}
