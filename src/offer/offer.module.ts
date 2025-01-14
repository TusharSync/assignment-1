import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { EmailModule } from '../email/email.module';
import { FileService } from '../file/file.service';
import { QueueService } from './queue.service';
import { EmailService } from './email.service';
import { Property,PropertySchema } from '../property/schemas/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema },{ name: Property.name, schema: PropertySchema }]),
    EmailModule,
  ],
  controllers: [],
  providers: [OfferService, QueueService, EmailService, FileService],
  exports: [OfferService],
})
export class OfferModule { }
