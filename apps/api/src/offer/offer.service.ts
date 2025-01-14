import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, Queue, Worker } from 'bullmq';
import { Offer } from './schemas/offer.schema';
import { Property } from '../property/schemas/property.schema';
import  PDFDocument from 'pdfkit';
import { FileService } from '../file/file.service';
import { EmailService } from './email.service';
import { QueueService } from './queue.service';

@Injectable()
export class OfferService implements OnModuleInit {
  private offerQueue: Queue;
  private offerWorker: Worker | null = null; // Track the worker


  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private queueService: QueueService,
    private emailService: EmailService,
    private fileService: FileService,
  ) {
    this.offerQueue = this.queueService.createQueue('offerQueue');
  }

  async onModuleInit() {
    console.log('Initializing OfferService...');
    await this.scheduleDailyOfferJob(); // Schedule daily job
    this.processOfferJobs(); // Start processing jobs
    console.log('OfferService initialized and job scheduled at 12:00 AM');
  }


  async onModuleDestroy() {
    // Gracefully stop the worker on shutdown
    if (this.offerWorker) {
      await this.offerWorker.close();
      console.log('OfferWorker stopped.');
    }
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
    await this.fileService.downloadPDF(
      offerData.templateUrl,
    );

    // const templateBuffer = await this.fileService.downloadPDF(
    //   offerData.templateUrl,
    // );

    const doc = new PDFDocument({
      autoFirstPage: false,
    });

    doc.addPage().text(`Offer Details for ${offerData.buyerName}`);
    doc.text(`Property ID: ${offerData.propertyId}`);
    doc.text(`Offer Amount: $${offerData.offerAmount}`);

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => { });

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

  async scheduleDailyOfferJob(): Promise<void> {
    await this.offerQueue.add('generateOffers', {}, {
      repeat: { pattern: '0 0 * * *' }, // Use `pattern` instead of `cron`
    });
    console.log('Daily Offer Job scheduled.');
  }
  async processOfferJobs(): Promise<void> {
    this.offerWorker = new Worker(
      'offerQueue',
      async (job: Job) => {
        console.log(`Processing job ${job.id} of type ${job.name}`);
        try {
          const users = await this.fetchAllUsers();
          for (const user of users) {
            const properties = await this.fetchPropertiesForUser(user);
            for (const property of properties) {
              if (!property.templateUrl) {
                console.error(`No template found for property: ${property._id}`);
                continue;
              }

              const pdfUrl = await this.generateOfferPDF({
                buyerName: user.name,
                propertyId: property._id,
                offerAmount: property.price,
                templateUrl: property.templateUrl,
              });

              await this.saveOffer({
                buyerName: user.name,
                buyerEmail: user.email,
                propertyId: property._id,
                offerAmount: property.price,
                pdfUrl,
              });

              await this.emailService.sendEmail(
                user.email,
                'Your Property Offer',
                `Dear ${user.name}, please find your offer attached.`,
                pdfUrl,
              );

              console.log(`Offer sent to ${user.email} for property ${property._id}`);
            }
          }
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          throw error; // Allow BullMQ to handle retries
        }
      },
      { connection: this.queueService.getConnectionOptions() },
    );

    this.offerWorker.on('completed', (job) => {
      console.log(`Job ${job.id} of type ${job.name} completed successfully.`);
    });

    this.offerWorker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} of type ${job?.name} failed:`, error.message);
    });
  }


  async saveOffer(data: {
    buyerName: string;
    buyerEmail: string;
    propertyId: string;
    offerAmount: number;
    pdfUrl: string;
  }): Promise<Offer> {
    const offer = new this.offerModel({
      propertyId: data.propertyId,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      offerAmount: data.offerAmount,
      emailChain: [],
    });
    return offer.save();
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
