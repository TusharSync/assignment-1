import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { EmailModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
import { OfferModule } from './offer/offer.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/real-estate-platform'),
    UserModule,
    PropertyModule,
    EmailModule,
    NotificationModule,
    OfferModule,
    FileModule,
  ],
})
export class AppModule {}
