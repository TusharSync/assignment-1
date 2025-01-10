import { Controller, Post, Body } from '@nestjs/common';
import { OfferService } from './offer.service';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('generate')
  async generateOffer(
    @Body() body: { propertyId: string; buyerDetails: any },
  ): Promise<any> {
    return this.offerService.generateOffer(body.propertyId, body.buyerDetails);
  }

  @Post('send-email')
  async sendOfferEmail(
    @Body() body: { offerId: string; email: string },
  ): Promise<any> {
    return this.offerService.sendOfferEmail(body.offerId, body.email);
  }
}
