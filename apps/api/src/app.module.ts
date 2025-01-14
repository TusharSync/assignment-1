import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { EmailModule } from './email/email.module';
import { OfferModule } from './offer/offer.module';
import { FileModule } from './file/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Specify the .env file location
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URL'),
      }),
    }),
    UserModule,
    PropertyModule,
    EmailModule,
    OfferModule,
    FileModule,
  ],
})
export class AppModule { }
