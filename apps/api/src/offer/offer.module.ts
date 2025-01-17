import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { EmailModule } from '../email/email.module';
import { FileService } from '../file/file.service';
import { QueueService } from './queue.service';
import { Property, PropertySchema } from '../property/schemas/property.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Email, EmailSchema } from '../email/schemas/email.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Property.name, schema: PropertySchema },
      { name: User.name, schema: UserSchema },
      { name: Email.name, schema: EmailSchema },
    ]),
    EmailModule,
  ],
  controllers: [],
  providers: [OfferService, QueueService, FileService],
  exports: [OfferService],
})
export class OfferModule {}
