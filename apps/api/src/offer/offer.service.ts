import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, Queue, Worker } from 'bullmq';
import { Offer } from './schemas/offer.schema';
import { Property } from '../property/schemas/property.schema';
import { PDFDocument } from 'pdf-lib';
import PDFKit from 'pdfkit';

import { FileService } from '../file/file.service';
import { QueueService } from './queue.service';
import { EmailService } from '../email/email.service';
import { User } from '../user/schemas/user.schema';
interface OfferData {
  buyerName: string;
  propertyId: string;
  offerAmount: number;
  templateUrl: string;
}
@Injectable()
export class OfferService implements OnModuleInit {
  private offerQueue: Queue;
  private offerWorker: Worker | null = null; // Track the worker

  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(User.name) private userModel: Model<User>,

    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private queueService: QueueService,
    private emailService: EmailService,
    private fileService: FileService
  ) {
    this.offerQueue = this.queueService.createQueue('offerQueue');
  }

  async onModuleInit() {
    console.log('Initializing OfferService...');
    await this.scheduleDailyOfferJob(); // Schedule scheduleDailyOfferJob
    this.processOfferJobs(); // Start processOfferJobs
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
    propertyId: string
  ): Promise<void> {
    // Upload template to S3/MinIO
    const pdfUrl = await this.fileService.uploadPDF(fileName, buffer);

    // Update property schema with template URL
    await this.propertyModel.updateOne(
      { _id: propertyId },
      { $set: { templateUrl: pdfUrl } }
    );
  }

  async generateOfferPDF(offerData: OfferData): Promise<string> {
    try {
      // Step 1: Download the template PDF
      const templateBuffer = await this.fileService.downloadPDF(
        offerData.templateUrl
      );

      // Step 2: Create a new PDF page with offer details using PDFKit
      const newPageBuffer = await this.createOfferDetailsPage(offerData);

      // Step 3: Merge the template with the new page using pdf-lib
      const mergedPdfBuffer = await this.mergePDFs(
        templateBuffer,
        newPageBuffer
      );

      // Step 4: Generate unique filename
      const filename = `offer-${offerData.propertyId}-${
        offerData.buyerName
      }-${Date.now()}.pdf`;

      // Step 5: Upload the merged PDF and get URL
      const pdfUrl = await this.fileService.uploadPDF(
        filename,
        mergedPdfBuffer
      );

      return pdfUrl;
    } catch (error) {
      console.error('Error generating offer PDF:', error);
      throw new Error(`Failed to generate offer PDF: ${error}`);
    }
  }

  private createOfferDetailsPage(offerData: OfferData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Create a new PDFKit document
      const doc = new PDFKit();
      const chunks: Buffer[] = [];

      // Collect chunks of data
      doc.on('data', (chunk) => chunks.push(chunk));

      // Resolve promise with complete buffer when done
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Handle errors
      doc.on('error', reject);

      // Add content to the page
      doc.fontSize(16).text('Offer Details', { align: 'center' }).moveDown();

      doc
        .fontSize(12)
        .text(`Buyer Name: ${offerData.buyerName}`)
        .moveDown(0.5)
        .text(`Property ID: ${offerData.propertyId}`)
        .moveDown(0.5)
        .text(`Offer Amount: $${offerData.offerAmount.toLocaleString()}`)
        .moveDown(0.5)
        .text(`Date: ${new Date().toLocaleDateString()}`);

      // Finalize the PDF
      doc.end();
    });
  }

  private async mergePDFs(
    templateBuffer: Buffer,
    newPageBuffer: Buffer
  ): Promise<Buffer> {
    // Load both PDFs
    const templateDoc = await PDFDocument.load(templateBuffer);
    const newPageDoc = await PDFDocument.load(newPageBuffer);

    // Copy the new page into the template document
    const [newPage] = await templateDoc.copyPages(newPageDoc, [0]);
    templateDoc.addPage(newPage);

    // Save the merged document
    return Buffer.from(await templateDoc.save());
  }

  async scheduleDailyOfferJob(): Promise<void> {
    await this.offerQueue.add(
      'generateOffers',
      {},
      {
        repeat: { pattern: '0 0 * * *' }, // Use `pattern` instead of `cron`
        // repeat: { every: 5000 }, // Use `pattern` instead of `cron`
      }
    );
    console.log('Daily Offer Job scheduled.');
  }
  async processOfferJobs(): Promise<void> {
    this.offerWorker = new Worker(
      'offerQueue',
      async (job: any) => {
        if (job) {
          console.log(`Processing job ${job.id} of type ${job.name}`);
        }
        const failedFiles = [];
        try {
          const users = await this.fetchAllUsers();
          for (const user of users) {
            const property = await this.fetchPropertiesForUser(user);
            if (!property) {
              console.error(`No property found`);
              continue;
            }

            const pdfUrl = await this.generateOfferPDF({
              buyerName: user.name,
              propertyId: property._id,
              offerAmount: property.price,
              templateUrl: property.templateUrl,
            });
            failedFiles.push(pdfUrl);
            const offer: any = await this.saveOffer({
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
              offer._id // Passing the offer ID to the sendEmail function
            );

            console.log(
              `Offer sent to ${user.email} for property ${property._id}`
            );
          }
        } catch (error) {
          if (job) {
            console.error(`Error processing job ${job.id}:`, error);
          }
          console.log(error, 'errorxxxxx');
          throw error; // Allow BullMQ to handle retries
        }
      },
      {
        connection: this.queueService.getConnectionOptions(),
      }
    );

    this.offerWorker.on('completed', (job) => {
      console.log(`Job ${job.id} of type ${job.name} completed successfully.`);
    });

    this.offerWorker.on('failed', (job, error) => {
      console.error(
        `Job ${job?.id} of type ${job?.name} failed:`,
        error.message
      );
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
      pdfUrl: data.pdfUrl,
      emailChain: [],
    });
    return offer.save();
  }

  private async fetchAllUsers(): Promise<any[]> {
    // Fetch users grouped by city, state, and area
    return this.userModel.find().exec();
  }

  private async fetchPropertiesForUser(user: any): Promise<any> {
    // Convert the user inputs to lowercase to ensure case-insensitive matching
    const lowerCaseCity = user.city.toLowerCase();
    const lowerCaseState = user.state.toLowerCase();
    const lowerCaseArea = user.area.toLowerCase();

    // First, find all propertyIds that this buyer has already made offers on
    const existingOfferPropertyIds = await this.offerModel.distinct(
      'propertyId',
      { buyerEmail: user.email }
    );
    // Build the query conditions
    const queryConditions: any[] = [
      {
        $or: [
          { city: lowerCaseCity }, // Exact match for city (case-insensitive)
          { state: lowerCaseState }, // Exact match for state (case-insensitive)
          { area: lowerCaseArea }, // Exact match for area (case-insensitive)
        ],
      },
    ];

    // Add exclusion condition only if existingOfferPropertyIds has elements
    if (existingOfferPropertyIds.length > 0) {
      queryConditions.push({
        _id: { $nin: existingOfferPropertyIds },
      });
    }

    // Perform the main query with dynamic conditions
    return this.propertyModel.findOne({
      $and: queryConditions,
    });
  }

  async trackEmailChain(offerId: string, emailContent: string): Promise<any> {
    return this.propertyModel.findByIdAndUpdate(
      offerId,
      { $push: { emailChain: emailContent } },
      { new: true }
    );
  }
}
