import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Offer extends Document {
  @Prop({ required: true })
  propertyId: string;

  @Prop({ required: true })
  buyerName: string;

  @Prop({ required: true })
  buyerEmail: string;

  @Prop({ required: true })
  offerAmount: number;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ required: true })
  pdfUrl: string; // Field to store the PDF template URL

  @Prop({ type: [String], default: [] })
  emailChain: string[];
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
