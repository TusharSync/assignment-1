// email.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Reply {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: new Date() })
  receivedAt: Date;
}

@Schema()
export class Email extends Document {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  offerId: string;

  @Prop({ required: true })
  recipient: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: new Date() })
  sentAt: Date;

  @Prop({ type: [Reply], default: [] })
  replies: Reply[];
}

export const EmailSchema = SchemaFactory.createForClass(Email);
