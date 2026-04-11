// Loads template files and turns them into actual email content

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { SupportedLocale } from '@domain/constants/supported-locales.constant';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';

@Injectable()
export class HandlebarsTemplateRenderer {
  constructor(private readonly configService: ConfigService) {}

  async render(
    templateKey: MailTemplateKey,
    locale: SupportedLocale,
    context: Record<string, unknown>,
  ): Promise<{
    subject: string;
    html: string;
    text?: string;
  }> {
    const configuredBasePath = this.configService.get<string>(
      'mail.templatesBasePath',
    );
    const fallbackLocale = this.configService.get<SupportedLocale>(
      'mail.fallbackLocale',
      'en',
    );

    if (!configuredBasePath) {
      throw new Error('Missing mail.templatesBasePath configuration');
    }

    const basePath = path.isAbsolute(configuredBasePath)
      ? configuredBasePath
      : path.resolve(process.cwd(), configuredBasePath);

    const safeLocale = await this.resolveLocale(
      basePath,
      templateKey,
      locale,
      fallbackLocale,
    );

    const [subjectSource, bodySource, layoutSource, textSource] =
      await Promise.all([
        this.readTemplate(basePath, templateKey, safeLocale, 'subject.hbs'),
        this.readTemplate(basePath, templateKey, safeLocale, 'body.hbs'),
        this.readLayout(basePath, 'base.hbs'),
        this.readOptionalTemplate(
          basePath,
          templateKey,
          safeLocale,
          'text.hbs',
        ),
      ]);

    const mergedContext = {
      ...context,
      ...this.getLocalePresentation(safeLocale),
    };

    const compiledBody = Handlebars.compile(bodySource)(mergedContext);

    const compiledHtml = Handlebars.compile(layoutSource)({
      ...mergedContext,
      body: compiledBody,
    });

    return {
      subject: Handlebars.compile(subjectSource)(mergedContext).trim(),
      html: compiledHtml,
      text: textSource
        ? Handlebars.compile(textSource)(mergedContext).trim()
        : undefined,
    };
  }

  private getLocalePresentation(locale: SupportedLocale): {
    lang: string;
    dir: 'ltr' | 'rtl';
    direction: 'ltr' | 'rtl';
    textAlign: 'left' | 'right';
  } {
    if (locale === 'ar') {
      return {
        lang: 'ar',
        dir: 'rtl',
        direction: 'rtl',
        textAlign: 'right',
      };
    }

    return {
      lang: locale,
      dir: 'ltr',
      direction: 'ltr',
      textAlign: 'left',
    };
  }

  private async resolveLocale(
    basePath: string,
    templateKey: MailTemplateKey,
    requestedLocale: SupportedLocale,
    fallbackLocale: SupportedLocale,
  ): Promise<SupportedLocale> {
    const requestedPath = path.join(basePath, templateKey, requestedLocale);

    try {
      await fs.access(requestedPath);
      return requestedLocale;
    } catch {
      return fallbackLocale;
    }
  }

  private async readTemplate(
    basePath: string,
    templateKey: MailTemplateKey,
    locale: SupportedLocale,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(basePath, templateKey, locale, fileName);
    return fs.readFile(filePath, 'utf-8');
  }

  private async readOptionalTemplate(
    basePath: string,
    templateKey: MailTemplateKey,
    locale: SupportedLocale,
    fileName: string,
  ): Promise<string | undefined> {
    const filePath = path.join(basePath, templateKey, locale, fileName);

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return undefined;
    }
  }

  private async readLayout(
    basePath: string,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(basePath, 'layouts', fileName);
    return fs.readFile(filePath, 'utf-8');
  }
}
