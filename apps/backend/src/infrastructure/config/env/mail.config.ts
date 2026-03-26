import { registerAs } from '@nestjs/config';
import type { SupportedLocale } from '@domain/constants/supported-locales.constant';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,

  defaults: {
    fromName: process.env.MAIL_DEFAULT_FROM_NAME ?? 'Sabilouna',
  },

  senders: {
    contact: {
      fromEmail: process.env.MAIL_NO_REPLY,
      replyTo: process.env.MAIL_CONTACT || undefined,
    },
    noReply: {
      fromEmail: process.env.MAIL_NO_REPLY,
    },
  },

  templatesBasePath: process.env.MAIL_TEMPLATES_BASE_PATH,

  fallbackLocale: (process.env.MAIL_FALLBACK_LOCALE ?? 'en') as SupportedLocale,
}));
