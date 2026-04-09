import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SendVerificationEmailDto } from '@application/dto/mail/send-verification-email.dto';
import { emailBranding } from '@domain/constants/email-branding';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { MAILER_PORT } from '@domain/interfaces/mailer.port';
import { TOKEN_PORT, type TokenPayload } from '@domain/interfaces/token.port';

import { SendMagicLinkLoginUseCase } from './send-magic-link-login.use-case';

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_EMAIL = 'user@example.com';
const MOCK_ROLE_ID = 2;
const MOCK_TOKEN = 'signed.magic.token';
const MOCK_ACCESS_TOKEN = 'signed.access.token';
const MOCK_FRONTEND_URL = 'https://app.example.com';

const SEND_DTO: SendVerificationEmailDto = { email: MOCK_EMAIL, locale: 'en' };

function makeUser(): { id: string; email: string; roleId: number } {
  return { id: MOCK_UUID, email: MOCK_EMAIL, roleId: MOCK_ROLE_ID };
}

function makePayload(): TokenPayload {
  return { sub: MOCK_UUID, email: MOCK_EMAIL, roles: [String(MOCK_ROLE_ID)] };
}

type MockedMailer = { sendTemplatedEmail: jest.Mock };
type MockedToken = {
  sign: jest.Mock;
  signRefreshToken: jest.Mock;
  verify: jest.Mock;
  verifyRefreshToken: jest.Mock;
};
type MockedUserRepo = { findByEmail: jest.Mock };

function createMocks(): {
  userRepository: MockedUserRepo;
  mailer: MockedMailer;
  tokenService: MockedToken;
} {
  return {
    userRepository: { findByEmail: jest.fn().mockResolvedValue(makeUser()) },
    mailer: { sendTemplatedEmail: jest.fn().mockResolvedValue(undefined) },
    tokenService: {
      sign: jest.fn().mockReturnValue(MOCK_TOKEN),
      signRefreshToken: jest.fn().mockReturnValue(MOCK_TOKEN),
      verify: jest.fn().mockReturnValue(makePayload()),
      verifyRefreshToken: jest.fn().mockReturnValue(makePayload()),
    },
  };
}

describe('SendMagicLinkLoginUseCase', () => {
  let useCase: SendMagicLinkLoginUseCase;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z').getTime());

    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMagicLinkLoginUseCase,
        { provide: 'IUserRepository', useValue: mocks.userRepository },
        { provide: MAILER_PORT, useValue: mocks.mailer },
        { provide: TOKEN_PORT, useValue: mocks.tokenService },
        { provide: 'FRONTEND_URL', useValue: MOCK_FRONTEND_URL },
      ],
    }).compile();

    useCase = module.get<SendMagicLinkLoginUseCase>(SendMagicLinkLoginUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('send', () => {
    it('should sign a token with correct payload and send magic link email', async () => {
      await useCase.send(SEND_DTO);

      const expectedLoginUrl = `${MOCK_FRONTEND_URL}/en/dashboard/${MOCK_UUID}?token=${MOCK_TOKEN}`;

      expect(mocks.tokenService.sign).toHaveBeenCalledWith(
        { sub: MOCK_UUID, email: MOCK_EMAIL, roles: [String(MOCK_ROLE_ID)] },
        '30',
      );
      expect(mocks.mailer.sendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mocks.mailer.sendTemplatedEmail).toHaveBeenCalledWith({
        to: MOCK_EMAIL,
        locale: 'en',
        senderKey: SystemEmailSender.NO_REPLY,
        templateKey: MailTemplateKey.MAGIC_LINK_LOGIN,
        context: {
          loginUrl: expectedLoginUrl,
          branding: emailBranding['en'],
          year: 2026,
        },
      });
    });

    it('should build loginUrl with correct locale segment', async () => {
      const frDto: SendVerificationEmailDto = { ...SEND_DTO, locale: 'fr' };

      await useCase.send(frDto);

      const expectedContext: Record<string, unknown> = {
        loginUrl: expect.stringContaining('/fr/dashboard/') as unknown,
        branding: emailBranding['fr'] as unknown,
      };
      const expectedCall: Record<string, unknown> = {
        locale: 'fr',
        context: expect.objectContaining(expectedContext) as unknown,
      };

      expect(mocks.mailer.sendTemplatedEmail).toHaveBeenCalledWith(
        expect.objectContaining(expectedCall),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.send(SEND_DTO)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
      expect(mocks.mailer.sendTemplatedEmail).not.toHaveBeenCalled();
    });

    it('should propagate error when mailer throws', async () => {
      mocks.mailer.sendTemplatedEmail.mockRejectedValue(
        new Error('SMTP failure'),
      );

      await expect(useCase.send(SEND_DTO)).rejects.toThrow('SMTP failure');
    });

    it('should resolve without returning a value', async () => {
      const result = await useCase.send(SEND_DTO);
      expect(result).toBeUndefined();
    });
  });

  describe('verify', () => {
    it('should return a new accessToken from a valid magic link token', () => {
      mocks.tokenService.sign.mockReturnValue(MOCK_ACCESS_TOKEN);

      const payload: TokenPayload = makePayload();
      const result: { accessToken: string } = useCase.verify(MOCK_TOKEN);

      expect(mocks.tokenService.verify).toHaveBeenCalledWith(MOCK_TOKEN);
      expect(mocks.tokenService.sign).toHaveBeenCalledWith({
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
      });
      expect(result).toEqual({ accessToken: MOCK_ACCESS_TOKEN });
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      mocks.tokenService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => useCase.verify('invalid.token')).toThrow(
        new UnauthorizedException('Invalid or expired link'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is malformed', () => {
      mocks.tokenService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      expect(() => useCase.verify('malformed')).toThrow(
        new UnauthorizedException('Invalid or expired link'),
      );
    });
  });
});
