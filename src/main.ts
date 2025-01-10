import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OfferService } from './offer/offer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Start processing offers
  const offerService = app.get(OfferService);
  await offerService.processOffers();

  await app.listen(3000);
}
bootstrap();
