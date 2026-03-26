import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EmailVerificationUseCase } from './email-verification.use-case';
import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import { TOKEN_PORT, TokenPayload } from '@domain/interfaces/token.port';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { emailBranding } from '@domain/constants/email-branding';
import { SupportedLocale } from '@domain/constants/supported-locales.constant';

const FRONTEND_URL = 'http://localhost:3000';

interface SendTemplatedEmailParams {
  to: string;
  locale: SupportedLocale;
  senderKey: SystemEmailSender;
  templateKey: MailTemplateKey;
  context: {
    verificationUrl: string;
    branding: unknown;
    year: number;
  };
}

const mockMailer = {
  sendTemplatedEmail: jest.fn() as jest.MockedFunction<
    (params: SendTemplatedEmailParams) => Promise<void>
  >,
};

const mockTokenPort = {
  sign: jest.fn() as jest.MockedFunction<
    (payload: { sub: string; email: string }) => string
  >,
  verify: jest.fn() as jest.MockedFunction<(token: string) => TokenPayload>,
};

describe('EmailVerificationUseCase', () => {
  let useCase: EmailVerificationUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationUseCase,
        { provide: MAILER_PORT, useValue: mockMailer },
        { provide: TOKEN_PORT, useValue: mockTokenPort },
        { provide: 'FRONTEND_URL', useValue: FRONTEND_URL },
      ],
    }).compile();

    useCase = module.get(EmailVerificationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    const dto = { email: 'user@example.com', locale: 'en' as SupportedLocale };
    const fakeToken = 'signed-token';

    beforeEach(() => {
      mockTokenPort.sign.mockReturnValue(fakeToken);
      mockMailer.sendTemplatedEmail.mockResolvedValue(undefined);
    });

    it('should sign a token with sub and email', async () => {
      await useCase.sendVerificationEmail(dto);

      expect(mockTokenPort.sign).toHaveBeenCalledWith({
        sub: dto.email,
        email: dto.email,
      });
    });

    it('should send a templated email with correct params', async () => {
      await useCase.sendVerificationEmail(dto);

      expect(mockMailer.sendTemplatedEmail).toHaveBeenCalledWith({
        to: dto.email,
        locale: dto.locale,
        senderKey: SystemEmailSender.NO_REPLY,
        templateKey: MailTemplateKey.EMAIL_VERIFICATION,
        context: {
          verificationUrl: `${FRONTEND_URL}/verify-email?token=${fakeToken}`,
          branding: emailBranding[dto.locale],
          year: new Date().getFullYear(),
        },
      });
    });

    it('should build the verification URL from the injected FRONTEND_URL', async () => {
      await useCase.sendVerificationEmail(dto);

      const call = mockMailer.sendTemplatedEmail.mock.calls[0][0];
      expect(call.context.verificationUrl).toBe(
        `${FRONTEND_URL}/verify-email?token=${fakeToken}`,
      );
    });
  });

  describe('validateToken', () => {
    const expectedEmail = 'user@example.com';
    const validPayload: TokenPayload = {
      sub: expectedEmail,
      email: expectedEmail,
    };

    it('should not throw when token is valid and email matches', () => {
      mockTokenPort.verify.mockReturnValue(validPayload);

      expect(() =>
        useCase.validateToken('valid-token', expectedEmail),
      ).not.toThrow();
    });

    it('should throw UnauthorizedException when tokenPort.verify throws', () => {
      mockTokenPort.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => useCase.validateToken('bad-token', expectedEmail)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload.sub does not match expectedEmail', () => {
      const mismatchedPayload: TokenPayload = {
        sub: 'other@example.com',
        email: 'other@example.com',
      };
      mockTokenPort.verify.mockReturnValue(mismatchedPayload);

      expect(() => useCase.validateToken('valid-token', expectedEmail)).toThrow(
        UnauthorizedException,
      );
    });

    it('should call tokenPort.verify with the provided token', () => {
      mockTokenPort.verify.mockReturnValue(validPayload);
      useCase.validateToken('my-token', expectedEmail);

      expect(mockTokenPort.verify).toHaveBeenCalledWith('my-token');
    });
  });
});
