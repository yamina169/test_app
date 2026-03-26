// Sends the email

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SystemEmailRegistry } from '../registry/system-email.registry';
import {
  MailerPort,
  SendTemplatedEmailInput,
} from '@domain/interfaces/mailer.port';
import { HandlebarsTemplateRenderer } from '../renderers/handlebars-template.renderer';

@Injectable()
export class SmtpMailerAdapter implements MailerPort, OnModuleInit {
  private readonly logger = new Logger(SmtpMailerAdapter.name);
  private transporter!: Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly senderRegistry: SystemEmailRegistry,
    private readonly templateRenderer: HandlebarsTemplateRenderer,
  ) {}

  onModuleInit(): void {
    this.transporter = nodemailer.createTransport({
      host: this.mustGet('mail.host'),
      port: this.configService.get<number>('mail.port', 587),
      secure: this.configService.get<boolean>('mail.secure', true),
      auth: {
        user: this.mustGet('mail.user'),
        pass: this.mustGet('mail.pass'),
      },
    });
  }

  async sendTemplatedEmail(input: SendTemplatedEmailInput): Promise<void> {
    const sender = this.senderRegistry.get(input.senderKey);
    const rendered = await this.templateRenderer.render(
      input.templateKey,
      input.locale,
      input.context,
    );

    this.logger.log(
      `Sending email from "${sender.fromName}" <${sender.fromEmail}> to ${input.to} with subject "${rendered.subject}"`,
    );

    await this.transporter.sendMail({
      from: `"${sender.fromName}" <${sender.fromEmail}>`,
      to: input.to,
      replyTo: sender.replyTo,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }

  private mustGet(path: string): string {
    const value = this.configService.get<string>(path);
    if (!value) {
      throw new Error(`Missing config value: ${path}`);
    }
    return value;
  }
}
