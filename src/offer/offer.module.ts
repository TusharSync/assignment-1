import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { BullModule } from '@nestjs/bull';
import { PropertyModule } from '../property/property.module';
import { EmailModule } from '../email/email.module';
import { RolesGuard } from '../user/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379, // Redis default port
      },
    }),
    BullModule.registerQueue({
      name: 'offerQueue',
    }),
    PropertyModule,
    EmailModule,
  ],
  controllers: [OfferController],
  providers: [OfferService, RolesGuard],
  exports: [OfferService],
})
export class OfferModule {}
