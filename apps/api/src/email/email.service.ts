import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(
    email: string,
    subject: string,
    text: string,
    pdfUrl: string,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.yourprovider.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-smtp-user',
        pass: 'your-smtp-password',
      },
    });

    await transporter.sendMail({
      from: 'offers@realestate.com',
      to: email,
      subject,
      text,
      html: `<p>${text}</p><p><a href="${pdfUrl}">Download Offer PDF</a></p>`,
    });
  }
}
