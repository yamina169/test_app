// Maps sender keys to real sender details.

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SystemEmailConfig } from '../types/system-email-config.type';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';

@Injectable()
export class SystemEmailRegistry {
  constructor(private readonly configService: ConfigService) {}

  get(sender: SystemEmailSender): SystemEmailConfig {
    const fromName = this.configService.get<string>(
      'mail.defaults.fromName',
      'Sabilouna',
    );

    switch (sender) {
      case SystemEmailSender.CONTACT:
        return {
          fromName,
          fromEmail: this.mustGet('mail.senders.contact.fromEmail'),
          replyTo: this.configService.get<string>(
            'mail.senders.contact.replyTo',
          ),
        };
      case SystemEmailSender.NO_REPLY:
        return {
          fromName,
          fromEmail: this.mustGet('mail.senders.noReply.fromEmail'),
        };

      default:
        throw new Error(`Unsupported system sender`);
    }
  }

  private mustGet(path: string): string {
    const value = this.configService.get<string>(path);
    if (!value) {
      throw new Error(`Missing mail config: ${path}`);
    }
    return value;
  }
}
