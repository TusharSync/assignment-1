import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queue, Worker } from 'bullmq';
import { Offer } from './schemas/offer.schema';
import { Property } from '../property/schemas/property.schema';
import * as PDFDocument from 'pdfkit';
import { FileService } from './file.service';
import { EmailService } from './email.service';
import { QueueService } from './queue.service';

@Injectable()
export class OfferService {
  private offerQueue: Queue;

  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private queueService: QueueService,
    private emailService: EmailService,
    private fileService: FileService,
  ) {
    this.offerQueue = this.queueService.createQueue('offerQueue');
  }

  async uploadTemplatePDF(
    fileName: string,
    buffer: Buffer,
    propertyId: string,
  ): Promise<void> {
    // Upload template to S3/MinIO
    const pdfUrl = await this.fileService.uploadPDF(fileName, buffer);

    // Update property schema with template URL
    await this.propertyModel.updateOne(
      { _id: propertyId },
      { $set: { templateUrl: pdfUrl } },
    );
  }

  async generateOfferPDF(offerData: {
    buyerName: string;
    propertyId: string;
    offerAmount: number;
    templateUrl: string;
  }): Promise<string> {
    const templateBuffer = await this.fileService.downloadPDF(
      offerData.templateUrl,
    );

    const doc = new PDFDocument({
      autoFirstPage: false,
    });

    doc.addPage().text(`Offer Details for ${offerData.buyerName}`);
    doc.text(`Property ID: ${offerData.propertyId}`);
    doc.text(`Offer Amount: $${offerData.offerAmount}`);

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.end();

    const generatedBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('finish', () => {
        resolve(Buffer.concat(buffers));
      });
    });

    const pdfUrl = await this.fileService.uploadPDF(
      `${offerData.propertyId}-${Date.now()}.pdf`,
      generatedBuffer,
    );

    return pdfUrl;
  }

  async saveOffer(offerData: {
    buyerName: string;
    propertyId: string;
    offerAmount: number;
    buyerEmail: string;
    pdfUrl: string;
  }): Promise<Offer> {
    const newOffer = new this.offerModel({
      propertyId: offerData.propertyId,
      buyerName: offerData.buyerName,
      buyerEmail: offerData.buyerEmail,
      offerAmount: offerData.offerAmount,
      pdfUrl: offerData.pdfUrl,
    });
    return newOffer.save();
  }

  async scheduleDailyOfferJob(): Promise<void> {
    await this.offerQueue.add(
      'generateOffers',
      {},
      { repeat: { pattern: '0 0 * * *' } },
    );
  }

  async processOffers(): Promise<void> {
    new Worker(
      'offerQueue',
      async (job: any) => {
        console.log(job);
        const users = await this.fetchAllUsers();
        for (const user of users) {
          const properties = await this.fetchPropertiesForUser(user);
          for (const property of properties) {
            const templateUrl = property.templateUrl;

            if (!templateUrl) {
              console.error(`Template not found for property ${property._id}`);
              continue;
            }

            const pdfUrl = await this.generateOfferPDF({
              buyerName: user.name,
              propertyId: property._id,
              offerAmount: property.price,
              templateUrl,
            });

            // Update email chain in property schema
            await this.propertyModel.updateOne(
              { _id: property._id },
              {
                $push: {
                  emailChains: {
                    userId: user._id,
                    pdfUrl,
                    sentAt: new Date(),
                    additionalDetails: {
                      buyerName: user.name,
                      offerAmount: property.price,
                    },
                  },
                },
              },
            );

            try {
              await this.emailService.sendEmail(
                user.email,
                'Your Property Offer',
                'Here is your offer.',
                pdfUrl,
              );
            } catch (error) {
              console.error(
                `Failed to send offer email to ${user.email}: ${error.message}`,
              );
            }
          }
        }
      },
      {
        connection: this.queueService.getConnectionOptions(),
      },
    );
  }

  private async fetchAllUsers(): Promise<any[]> {
    // Fetch users grouped by city, state, and area
    return this.propertyModel.aggregate([
      { $group: { _id: { city: '$city', state: '$state', area: '$area' } } },
    ]);
  }

  private async fetchPropertiesForUser(user: any): Promise<any[]> {
    // Fetch properties ensuring no duplicates for the user
    return this.propertyModel.aggregate([
      { $match: { city: user.city, state: user.state, area: user.area } },
    ]);
  }

  async trackEmailChain(offerId: string, emailContent: string): Promise<any> {
    return this.propertyModel.findByIdAndUpdate(
      offerId,
      { $push: { emailChain: emailContent } },
      { new: true },
    );
  }
}
