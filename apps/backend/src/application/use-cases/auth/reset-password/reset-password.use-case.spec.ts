import { Test, TestingModule } from '@nestjs/testing';

import { ResetPasswordDto } from '@application/dto/auth/reset-password.dto';
import { SendResetPasswordEmailUseCase } from '../../mail/email-reset-password/send-reset-password-email.use-case';
import { ResetPasswordUseCase } from './reset-password.use-case';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashed'),
}));

jest.mock('crypto', () => ({
  ...jest.requireActual<typeof import('crypto')>('crypto'),
  randomInt: jest.fn().mockReturnValue(123456),
}));

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_EMAIL = 'user@example.com';
const MOCK_OTP = '123456';
const MOCK_NEW_PASSWORD = 'NewP@ssw0rd!';

const REQUEST_OTP_DTO: Pick<ResetPasswordDto, 'email'> = {
  email: MOCK_EMAIL,
};

const RESET_PASSWORD_DTO: Required<ResetPasswordDto> = {
  email: MOCK_EMAIL,
  code: MOCK_OTP,
  newPassword: MOCK_NEW_PASSWORD,
};

function makeOtpData(overrides?: { code?: string; isValid?: boolean }) {
  return {
    code: overrides?.code ?? MOCK_OTP,
    isValid: jest.fn().mockReturnValue(overrides?.isValid ?? true),
  };
}

function makeUser(otpData?: ReturnType<typeof makeOtpData> | null) {
  return {
    id: MOCK_UUID,
    email: MOCK_EMAIL,
    otpData: otpData !== undefined ? otpData : makeOtpData(),
  };
}

function createMocks() {
  return {
    userRepository: {
      findByEmail: jest.fn(),
      saveOtp: jest.fn().mockResolvedValue(undefined),
      clearOtp: jest.fn().mockResolvedValue(undefined),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    },
    sendResetPasswordEmailUseCase: {
      execute: jest.fn().mockResolvedValue(undefined),
    },
  };
}

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T10:00:00Z').getTime());

    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        { provide: 'IUserRepository', useValue: mocks.userRepository },
        {
          provide: SendResetPasswordEmailUseCase,
          useValue: mocks.sendResetPasswordEmailUseCase,
        },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('requestOtp', () => {
    it('should save OTP and send email on valid email', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser(null));

      await useCase.requestOtp(REQUEST_OTP_DTO, 'en');

      expect(mocks.userRepository.saveOtp).toHaveBeenCalledWith(
        MOCK_UUID,
        MOCK_OTP,
        new Date('2024-06-15T10:10:00Z'),
      );
      expect(mocks.sendResetPasswordEmailUseCase.execute).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        locale: 'en',
        code: MOCK_OTP,
        expiresInMinutes: 10,
      });
    });

    it('should throw when user is not found', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.requestOtp(REQUEST_OTP_DTO, 'en')).rejects.toThrow(
        `User with email ${MOCK_EMAIL} not found`,
      );

      expect(mocks.userRepository.saveOtp).not.toHaveBeenCalled();
      expect(
        mocks.sendResetPasswordEmailUseCase.execute,
      ).not.toHaveBeenCalled();
    });

    it('should throw when email sending fails', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser(null));
      mocks.sendResetPasswordEmailUseCase.execute.mockRejectedValue(
        new Error('SMTP error'),
      );

      await expect(useCase.requestOtp(REQUEST_OTP_DTO, 'en')).rejects.toThrow(
        'Failed to send OTP email: SMTP error',
      );

      expect(mocks.userRepository.saveOtp).toHaveBeenCalledTimes(1);
    });

    it('should work with all supported locales', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser(null));

      for (const locale of ['en', 'fr', 'ar'] as const) {
        mocks.sendResetPasswordEmailUseCase.execute.mockResolvedValue(
          undefined,
        );

        await useCase.requestOtp(REQUEST_OTP_DTO, locale);

        expect(
          mocks.sendResetPasswordEmailUseCase.execute,
        ).toHaveBeenCalledWith(expect.objectContaining({ locale }));
      }
    });
  });

  describe('resetPassword', () => {
    it('should clear OTP and update password on valid code', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser());

      await useCase.resetPassword(RESET_PASSWORD_DTO);

      expect(mocks.userRepository.clearOtp).toHaveBeenCalledWith(MOCK_UUID);
      expect(mocks.userRepository.updatePassword).toHaveBeenCalledWith(
        MOCK_UUID,
        '$2b$10$hashed',
      );
    });

    it('should throw when user is not found', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.resetPassword(RESET_PASSWORD_DTO)).rejects.toThrow(
        'User not found',
      );

      expect(mocks.userRepository.clearOtp).not.toHaveBeenCalled();
      expect(mocks.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw when otpData is null (OTP never requested)', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser(null));

      await expect(useCase.resetPassword(RESET_PASSWORD_DTO)).rejects.toThrow(
        'OTP expired or not requested',
      );

      expect(mocks.userRepository.clearOtp).not.toHaveBeenCalled();
    });

    it('should throw when OTP is expired', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(
        makeUser(makeOtpData({ isValid: false })),
      );

      await expect(useCase.resetPassword(RESET_PASSWORD_DTO)).rejects.toThrow(
        'OTP expired or not requested',
      );

      expect(mocks.userRepository.clearOtp).not.toHaveBeenCalled();
    });

    it('should throw when OTP code does not match', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(
        makeUser(makeOtpData({ code: '999999' })),
      );

      await expect(useCase.resetPassword(RESET_PASSWORD_DTO)).rejects.toThrow(
        'Invalid OTP code',
      );

      expect(mocks.userRepository.clearOtp).not.toHaveBeenCalled();
      expect(mocks.userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('should clear OTP before updating password', async () => {
      const callOrder: string[] = [];
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser());
      mocks.userRepository.clearOtp.mockImplementation(() => {
        callOrder.push('clearOtp');
      });
      mocks.userRepository.updatePassword.mockImplementation(() => {
        callOrder.push('updatePassword');
      });

      await useCase.resetPassword(RESET_PASSWORD_DTO);

      expect(callOrder).toEqual(['clearOtp', 'updatePassword']);
    });
  });
});
