import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Property extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  propertyType: string;

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
