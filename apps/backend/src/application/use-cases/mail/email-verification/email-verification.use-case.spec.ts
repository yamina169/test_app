import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EmailVerificationUseCase } from './email-verification.use-case';
import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { emailBranding } from '@domain/constants/email-branding';
import { SupportedLocale } from '@domain/constants/supported-locales.constant';

interface EmailContext {
  code: string;
  branding: unknown;
  year: number;
}

interface SendTemplatedEmailCall {
  to: string;
  locale: SupportedLocale;
  senderKey: SystemEmailSender;
  templateKey: MailTemplateKey;
  context: EmailContext;
}

const mockMailer = {
  sendTemplatedEmail: jest.fn<Promise<void>, [SendTemplatedEmailCall]>(),
};

function getLastCall(): SendTemplatedEmailCall {
  const calls = mockMailer.sendTemplatedEmail.mock.calls;
  return calls[calls.length - 1][0];
}

describe('EmailVerificationUseCase', () => {
  let useCase: EmailVerificationUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationUseCase,
        { provide: MAILER_PORT, useValue: mockMailer },
      ],
    }).compile();

    useCase = module.get(EmailVerificationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    const dto = { email: 'user@example.com', locale: 'en' as SupportedLocale };

    beforeEach(() => {
      mockMailer.sendTemplatedEmail.mockResolvedValue(undefined);
    });

    it('should send a templated email with the correct static params', async () => {
      await useCase.sendVerificationEmail(dto);

      expect(getLastCall()).toMatchObject({
        to: dto.email,
        locale: dto.locale,
        senderKey: SystemEmailSender.NO_REPLY,
        templateKey: MailTemplateKey.EMAIL_VERIFICATION,
        context: {
          branding: emailBranding[dto.locale],
          year: new Date().getFullYear(),
        },
      });
    });

    it('should include a 6-digit OTP code in the email context', async () => {
      await useCase.sendVerificationEmail(dto);

      expect(getLastCall().context.code).toMatch(/^\d{6}$/);
    });

    it('should store the OTP so that verifyOtp succeeds immediately after', async () => {
      await useCase.sendVerificationEmail(dto);

      const { code } = getLastCall().context;

      expect(() => useCase.verifyOtp(dto.email, code)).not.toThrow();
    });
  });

  describe('verifyOtp', () => {
    const email = 'user@example.com';
    const TTL_MS = 10 * 60 * 1000;

    beforeEach(() => {
      mockMailer.sendTemplatedEmail.mockResolvedValue(undefined);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    async function seedOtp(): Promise<string> {
      await useCase.sendVerificationEmail({
        email,
        locale: 'en' as SupportedLocale,
      });
      return getLastCall().context.code;
    }

    it('should not throw when the code is valid and not expired', async () => {
      const sentCode = await seedOtp();

      expect(() => useCase.verifyOtp(email, sentCode)).not.toThrow();
    });

    it('should throw UnauthorizedException when no OTP exists for the email', () => {
      expect(() => useCase.verifyOtp('unknown@example.com', '123456')).toThrow(
        new UnauthorizedException('Invalid or expired OTP code'),
      );
    });

    it('should throw UnauthorizedException when the OTP has expired', async () => {
      const sentCode = await seedOtp();

      jest.advanceTimersByTime(TTL_MS + 1);

      expect(() => useCase.verifyOtp(email, sentCode)).toThrow(
        new UnauthorizedException('OTP code has expired'),
      );
    });

    it('should throw UnauthorizedException when the code is incorrect', async () => {
      await seedOtp();

      expect(() => useCase.verifyOtp(email, '000000')).toThrow(
        new UnauthorizedException('Incorrect OTP code'),
      );
    });

    it('should delete the OTP after successful verification (one-time use)', async () => {
      const sentCode = await seedOtp();

      useCase.verifyOtp(email, sentCode);

      expect(() => useCase.verifyOtp(email, sentCode)).toThrow(
        new UnauthorizedException('Invalid or expired OTP code'),
      );
    });

    it('should delete the OTP after expiry check (no reuse after expiry)', async () => {
      const sentCode = await seedOtp();

      jest.advanceTimersByTime(TTL_MS + 1);
      expect(() => useCase.verifyOtp(email, sentCode)).toThrow(
        UnauthorizedException,
      );

      expect(() => useCase.verifyOtp(email, sentCode)).toThrow(
        new UnauthorizedException('Invalid or expired OTP code'),
      );
    });
  });
});
