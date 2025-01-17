import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {
     // Start listening for replies
     this.emailService.listenForReplies()
     .catch(err => console.error('Failed to start email listener:', err));
  }
}
