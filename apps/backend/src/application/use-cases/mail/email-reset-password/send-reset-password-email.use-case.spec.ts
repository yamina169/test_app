import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SendResetPasswordEmailDto } from '@application/dto/mail/send-reset-password-email.dto';
import { emailBranding } from '@domain/constants/email-branding';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { MAILER_PORT, type MailerPort } from '@domain/interfaces/mailer.port';

import { SendResetPasswordEmailUseCase } from './send-reset-password-email.use-case';

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_EMAIL = 'user@example.com';

const VALID_DTO: SendResetPasswordEmailDto = {
  email: MOCK_EMAIL,
  locale: 'en',
  code: '123456',
  expiresInMinutes: 10,
};

function makeUser() {
  return { id: MOCK_UUID, email: MOCK_EMAIL };
}

function createMocks() {
  return {
    mailer: {
      sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<MailerPort>,
    userRepository: {
      findByEmail: jest.fn().mockResolvedValue(makeUser()),
    },
  };
}

describe('SendResetPasswordEmailUseCase', () => {
  let useCase: SendResetPasswordEmailUseCase;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z').getTime());

    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendResetPasswordEmailUseCase,
        { provide: MAILER_PORT, useValue: mocks.mailer },
        { provide: 'IUserRepository', useValue: mocks.userRepository },
      ],
    }).compile();

    useCase = module.get<SendResetPasswordEmailUseCase>(
      SendResetPasswordEmailUseCase,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('successful execution', () => {
    it('should send reset password email with correct payload', async () => {
      await useCase.execute(VALID_DTO);

      expect(mocks.mailer.sendTemplatedEmail).toHaveBeenCalledTimes(1);
      expect(mocks.mailer.sendTemplatedEmail).toHaveBeenCalledWith({
        to: MOCK_EMAIL,
        locale: 'en',
        senderKey: SystemEmailSender.NO_REPLY,
        templateKey: MailTemplateKey.RESET_PASSWORD_OTP,
        context: {
          code: VALID_DTO.code,
          expiresInMinutes: VALID_DTO.expiresInMinutes,
          branding: emailBranding['en'],
          year: 2026,
        },
      });
    });

    it('should use branding matching the input locale', async () => {
      const frDto: SendResetPasswordEmailDto = { ...VALID_DTO, locale: 'fr' };

      await useCase.execute(frDto);

      const calledWith = mocks.mailer.sendTemplatedEmail.mock.calls[0]?.[0];
      expect(calledWith?.locale).toBe('fr');
      expect(calledWith?.context).toMatchObject({
        branding: emailBranding['fr'],
      });
    });

    it('should resolve without returning a value', async () => {
      const result = await useCase.execute(VALID_DTO);
      expect(result).toBeUndefined();
    });
  });

  describe('locale validation', () => {
    it('should throw BadRequestException for unsupported locale', async () => {
      const dto: SendResetPasswordEmailDto = {
        ...VALID_DTO,
        locale: 'es' as 'en',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        new BadRequestException('Unsupported locale: es'),
      );

      expect(mocks.mailer.sendTemplatedEmail).not.toHaveBeenCalled();
      expect(mocks.userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('user validation', () => {
    it('should throw BadRequestException when email is not found', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(VALID_DTO)).rejects.toThrow(
        new BadRequestException('Email not found'),
      );

      expect(mocks.mailer.sendTemplatedEmail).not.toHaveBeenCalled();
    });
  });

  describe('mailer failure', () => {
    it('should propagate error when mailer throws', async () => {
      mocks.mailer.sendTemplatedEmail.mockRejectedValue(
        new Error('SMTP failure'),
      );

      await expect(useCase.execute(VALID_DTO)).rejects.toThrow('SMTP failure');
    });
  });
});
