import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './schemas/offer.schema';
import { Queue } from 'bullmq';
import * as PDFDocument from 'pdfkit';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OfferService {
  private offerQueue: Queue;

  constructor(@InjectModel(Offer.name) private offerModel: Model<Offer>) {
    this.offerQueue = new Queue('offerQueue', {
      connection: {
        host: 'localhost',
        port: 5672, // RabbitMQ default port
      },
    });
  }

  async generateOfferPDF(offerData: {
    buyerName: string;
    propertyId: string;
    offerAmount: number;
  }): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(16).text('Offer Details', { underline: true });
    doc.moveDown();
    doc.text(`Buyer Name: ${offerData.buyerName}`);
    doc.text(`Property ID: ${offerData.propertyId}`);
    doc.text(`Offer Amount: $${offerData.offerAmount}`);

    doc.end();
    return new Promise((resolve) => {
      doc.on('finish', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  async sendEmailWithSMTP(
    email: string,
    subject: string,
    text: string,
    pdfBuffer: Buffer,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.yourprovider.com',
      port: 587,
      secure: false, // true for 465, false for other ports
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
      attachments: [
        {
          filename: 'offer.pdf',
          content: pdfBuffer,
        },
      ],
    });
  }

  async scheduleDailyOfferJob(): Promise<void> {
    await this.offerQueue.add(
      'generateOffers',
      {},
      { repeat: { cron: '0 0 * * *' } },
    ); // Runs daily at 12:00 AM
  }

  async processOffers(): Promise<void> {
    this.offerQueue.process(async (job) => {
      const users = await this.getUsersByCityStateArea(); // Fetch users and properties based on their registration details
      for (const user of users) {
        const properties = await this.getNewPropertiesForUser(user); // Ensure no duplicate properties
        for (const property of properties) {
          const pdfBuffer = await this.generateOfferPDF({
            buyerName: user.name,
            propertyId: property._id,
            offerAmount: property.price,
          });

          try {
            await this.sendEmailWithSMTP(
              user.email,
              'Your Property Offer',
              'Here is your offer.',
              pdfBuffer,
            );
          } catch (error) {
            console.error(
              `Failed to send offer email to ${user.email}: ${error.message}`,
            );
          }
        }
      }
    });
  }

  private async getUsersByCityStateArea(): Promise<any[]> {
    // Implement fetching users grouped by city, state, and area
    return [];
  }

  private async getNewPropertiesForUser(user: any): Promise<any[]> {
    // Fetch properties ensuring no duplicates for the user
    return [];
  }
}
