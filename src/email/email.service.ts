import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email } from './schemas/email.schema';

@Injectable()
export class EmailService {
  constructor(@InjectModel(Email.name) private emailModel: Model<Email>) {}

  async sendEmail(
    recipient: string,
    subject: string,
    body: string,
  ): Promise<Email> {
    const email = new this.emailModel({ recipient, subject, body });
    return email.save();
  }

  async getAllEmails(): Promise<Email[]> {
    return this.emailModel.find().exec();
  }

  async getEmailById(id: string): Promise<Email> {
    return this.emailModel.findById(id).exec();
  }
}
