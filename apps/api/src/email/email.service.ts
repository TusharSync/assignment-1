import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { simpleParser } from 'mailparser';
import Imap from 'imap';
import { v4 as uuidv4 } from 'uuid';
import { Email } from './schemas/email.schema';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private imap: Imap;

  constructor(
    @InjectModel(Email.name) private emailModel: Model<Email>,
    private configService: ConfigService
  ) {
    // Initialize SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('SMTP_HOST'),
      port: configService.get<number>('SMTP_PORT'),
      secure: configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    });

    // Initialize IMAP client with better error handling
    this.initializeImap();
  }

  private initializeImap(): void {
    this.imap = new Imap({
      user: this.configService.get<string>('SMTP_USER') ?? '',
      password: this.configService.get<string>('SMTP_PASS') ?? '',
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 3000,
      keepalive: true, // Enable keepalive
      debug: console.log, // Enable debug logging
    });

    // Improved error handling
    this.imap.on('error', (err: Error) => {
      console.error('🔥 IMAP Connection Error:', err.message);
      this.reconnectImap();
    });

    this.imap.on('end', () => {
      console.log('📪 IMAP Connection ended - attempting to reconnect...');
      this.reconnectImap();
    });
  }

  private async reconnectImap(): Promise<void> {
    console.log('🔄 Attempting to reconnect IMAP...');
    setTimeout(() => {
      this.imap.connect();
    }, 5000); // Wait 5 seconds before reconnecting
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    pdfUrl: string,
    offerId: string // Add offerId as a parameter
  ): Promise<Email> {
    console.log(`📧 Sending email to: ${to}`);
    const messageId = `<${uuidv4()}@gmail.com>`;

    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to,
      subject,
      text,
      html: `
        <p>${text}</p>
        <p><a href="${pdfUrl}">Download Offer PDF</a></p>
      `,
      headers: {
        'Message-ID': messageId,
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent successfully to ${to} with Message-ID: ${messageId}`
      );

      const newEmail = new this.emailModel({
        offerId, // Add the offerId here
        messageId,
        recipient: to,
        subject,
        body: text,
        sentAt: new Date(),
        replies: [],
      });

      const savedEmail = await newEmail.save();
      console.log(`💾 Email saved to database with ID: ${savedEmail._id}`);
      return savedEmail;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async listenForReplies(): Promise<void> {
    console.log('👂 Starting to listen for email replies...');
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err) => {
          if (err) {
            console.error('❌ Error opening INBOX:', err);
            reject(err);
            return;
          }
          console.log(
            '📬 IMAP connection established and INBOX opened successfully'
          );

          // Listen for new emails
          this.imap.on('mail', async (numNew: number) => {
            console.log(`📨 ${numNew} new email(s) received`);
            await this.fetchNewEmails(numNew);
          });
        });
      });

      this.imap.connect();
    });
  }

  private async fetchNewEmails(numNew: number): Promise<void> {
    try {
      console.log(
        `🔍 Searching for last ${Math.min(numNew, 10)} unread emails...`
      );

      this.imap.search(['UNSEEN'], async (err, results) => {
        if (err) {
          console.error('❌ Error searching for unread emails:', err);
          return;
        }

        if (!results || results.length === 0) {
          console.log('ℹ️ No unread emails found');
          return;
        }

        // Get the last 10 emails
        const last10Results = results.slice(-Math.min(results.length, 10));
        console.log(`📩 Processing ${last10Results.length} unread email(s)`);

        const fetch = this.imap.fetch(last10Results, {
          bodies: [
            'HEADER.FIELDS (FROM TO SUBJECT MESSAGE-ID IN-REPLY-TO)',
            'TEXT',
          ],
          struct: true,
          markSeen: true,
        });

        fetch.on('message', (msg) => {
          this.processMessage(msg);
        });

        fetch.once('end', () => {
          console.log('✅ Finished processing batch of unread emails');
        });
      });
    } catch (error) {
      console.error('❌ Error in fetchNewEmails:', error);
    }
  }

  private processMessage(msg: any): void {
    const emailData: any = {};

    msg.on('body', (stream: any, info: any) => {
      let buffer = '';
      stream.on('data', (chunk: any) => {
        buffer += chunk.toString('utf8');
      });

      stream.once('end', async () => {
        try {
          if (info.which.includes('HEADER')) {
            const parsed = await simpleParser(buffer);
            emailData.headers = {
              messageId: parsed.messageId,
              inReplyTo: parsed.inReplyTo,
              subject: parsed.subject,
              from: parsed.from?.text,
            };
            console.log(
              `📨 Processing email: "${parsed.subject}" from ${parsed.from?.text}`
            );
          } else {
            emailData.body = buffer.trim();
          }
        } catch (error) {
          console.error('❌ Error parsing email:', error);
        }
      });
    });

    msg.once('end', async () => {
      if (emailData.headers?.inReplyTo) {
        console.log(
          `🔄 Reply detected for message: ${emailData.headers.inReplyTo}`
        );
        await this.processReply(emailData);
      } else {
        console.log('ℹ️ Not a reply - skipping processing');
      }
    });
  }

  private async processReply(emailData: any): Promise<void> {
    try {
      const inReplyToMessageId = emailData.headers?.inReplyTo;

      if (!inReplyToMessageId) {
        console.warn('⚠️ No inReplyTo field found in email headers');
        return;
      }

      const reply = {
        messageId: emailData.headers.messageId,
        from: emailData.headers.from,
        subject: emailData.headers.subject,
        body: emailData.body,
        receivedAt: new Date(),
      };

      const updatedEmail = await this.emailModel.findOneAndUpdate(
        { messageId: inReplyToMessageId },
        { $push: { replies: reply } },
        { new: true }
      );

      if (updatedEmail) {
        console.log(`✅ Reply saved for email: ${inReplyToMessageId}`);
        console.log(`📝 Reply details:
          From: ${reply.from}
          Subject: ${reply.subject}
          Received: ${reply.receivedAt}`);
      } else {
        console.warn(
          `⚠️ Original email not found for message ID: ${inReplyToMessageId}`
        );
      }
    } catch (error) {
      console.error('❌ Error processing reply:', error);
      throw error;
    }
  }

  async getEmailThread(messageId: string): Promise<Email | null> {
    console.log(`🔍 Fetching email thread for message ID: ${messageId}`);
    try {
      const thread = await this.emailModel.findOne({ messageId }).exec();
      if (thread) {
        console.log(`✅ Found thread with ${thread.replies.length} replies`);
      } else {
        console.log('ℹ️ No thread found for this message ID');
      }
      return thread;
    } catch (error) {
      console.error('❌ Error fetching email thread:', error);
      throw error;
    }
  }
}
