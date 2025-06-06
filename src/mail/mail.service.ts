import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(data: {
    email: string;
    subject: string;
    text: string;
    htmlContent: string;
  }) {
    console.log(
      '🚀 ~ EmailService ~ constructor ~ process.env.SMTP_SERVICE:',
      process.env.SMTP_SERVICE,
    );
    console.log(
      '🚀 ~ EmailService ~ constructor ~ rocess.env.SMTP_USER:',
      process.env.SMTP_MAIL,
    );
    console.log(
      '🚀 ~ EmailService ~ constructor ~ process.env.SMTP_PASS,:',
      process.env.SMTP_PASSWORD,
    );
    console.log('🚀 ~ EmailService ~ sendEmail ~ data:', data);

    try {
      const result = await this.transporter.sendMail({
        from: `"RGT Team" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: data.subject,
        text: data.text,
        html: data.htmlContent,
      });

      Logger.debug('🚀 ~ EmailService ~ sendEmail ~ result:', result);
      Logger.verbose('Email sent');
    } catch (error: any) {
      Logger.error(`EmailService ~ sendEmail ~ error: ${error.message}`);
      throw new Error('Failed to send email');
    }
  }
}
