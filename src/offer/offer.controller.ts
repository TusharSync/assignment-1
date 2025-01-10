import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { OfferService } from './offer.service';
import { Roles } from '../user/roles.decorator';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';

@Controller('offer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('generate')
  @Roles('admin')
  async generateOffer(
    @Body()
    body: {
      buyerName: string;
      propertyId: string;
      offerAmount: number;
      buyerEmail: string;
    },
  ): Promise<any> {
    const pdfBuffer = await this.offerService.generateOfferPDF(body);

    // Save offer to database
    const newOffer = new this.offerService.offerModel({
      propertyId: body.propertyId,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      offerAmount: body.offerAmount,
    });
    const savedOffer = await newOffer.save();

    // Send email with PDF
    await this.offerService.sendEmailWithSMTP(
      body.buyerEmail,
      'Your Property Offer',
      'Here is your offer.',
      pdfBuffer,
    );
    return {
      message: 'Offer generated and emailed successfully',
      offerId: savedOffer._id,
    };
  }

  @Post('track-email/:offerId')
  @Roles('admin')
  async trackEmail(
    @Param('offerId') offerId: string,
    @Body() body: { emailContent: string },
  ): Promise<any> {
    return this.offerService.trackEmailChain(offerId, body.emailContent);
  }

  @Get('schedule-job')
  @Roles('admin')
  async scheduleDailyOfferJob(): Promise<any> {
    await this.offerService.scheduleDailyOfferJob();
    return { message: 'Daily offer job scheduled successfully' };
  }
}
