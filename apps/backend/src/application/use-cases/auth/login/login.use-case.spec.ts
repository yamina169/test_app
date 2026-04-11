/// <reference types="jest" />
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { LoginWithEmailDto } from '@application/dto/auth/login/login-with-email.dto';
import { LoginWithHandicapCardDto } from '@application/dto/auth/login/login-with-handicap-card.dto';
import { SendMagicLinkLoginUseCase } from '@application/use-cases/mail/magic-link-login/send-magic-link-login.use-case';
import { TOKEN_PORT } from '@domain/interfaces/token.port';
import { AccountStatus } from '@domain/enums/user.enum';

import { LoginUseCase } from './login.use-case';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const MOCK_UUID = '00000000-0000-0000-0000-000000000001';
const MOCK_EMAIL = 'user@example.com';
const MOCK_PASSWORD = 'P@ssw0rd!';
const MOCK_HASHED = '$2b$10$hashedpassword';
const MOCK_HANDICAP_CARD_ID = 'HC-123';
const MOCK_ACCESS_TOKEN = 'access.token.jwt';
const MOCK_REFRESH_TOKEN = 'refresh.token.jwt';

const EMAIL_DTO: LoginWithEmailDto = {
  email: MOCK_EMAIL,
  password: MOCK_PASSWORD,
};

const HANDICAP_CARD_DTO: LoginWithHandicapCardDto = {
  handicapCardId: MOCK_HANDICAP_CARD_ID,
  locale: 'en',
};

function makeUser(status: AccountStatus = AccountStatus.ACTIVE) {
  return {
    id: MOCK_UUID,
    email: MOCK_EMAIL,
    password: MOCK_HASHED,
    roleId: 2,
    status,
    handicapProfile: { handicapCardId: MOCK_HANDICAP_CARD_ID },
  };
}

function createMocks() {
  return {
    userRepository: {
      findByEmail: jest.fn(),
      findByHandicapCardId: jest.fn(),
    },
    tokenService: {
      sign: jest.fn().mockReturnValue(MOCK_ACCESS_TOKEN),
      signRefreshToken: jest.fn().mockReturnValue(MOCK_REFRESH_TOKEN),
    },
    sendMagicLinkLoginUseCase: {
      send: jest.fn().mockResolvedValue(undefined),
    },
  };
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(async () => {
    mocks = createMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: 'IUserRepository', useValue: mocks.userRepository },
        { provide: TOKEN_PORT, useValue: mocks.tokenService },
        {
          provide: SendMagicLinkLoginUseCase,
          useValue: mocks.sendMagicLinkLoginUseCase,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('email login', () => {
    it('should return accessToken and refreshToken on valid credentials', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await useCase.execute(EMAIL_DTO);

      expect(result).toEqual({
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      });
      expect(mocks.tokenService.sign).toHaveBeenCalledWith({
        sub: MOCK_UUID,
        email: MOCK_EMAIL,
        roles: [String(makeUser().roleId)],
      });
      expect(mocks.tokenService.signRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(EMAIL_DTO)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(useCase.execute(EMAIL_DTO)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when account is PENDING', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(
        makeUser(AccountStatus.PENDING),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(useCase.execute(EMAIL_DTO)).rejects.toThrow(
        new UnauthorizedException('Account inactive or suspended'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when account is DISABLED', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(
        makeUser(AccountStatus.DISABLED),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(useCase.execute(EMAIL_DTO)).rejects.toThrow(
        new UnauthorizedException('Account inactive or suspended'),
      );

      expect(mocks.tokenService.sign).not.toHaveBeenCalled();
    });
  });

  describe('handicap card login', () => {
    it('should send magic link and return magicLinkSent: true for active user', async () => {
      mocks.userRepository.findByHandicapCardId.mockResolvedValue(makeUser());

      const result = await useCase.execute(HANDICAP_CARD_DTO);

      expect(result).toEqual({ magicLinkSent: true });
      expect(mocks.sendMagicLinkLoginUseCase.send).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        locale: HANDICAP_CARD_DTO.locale,
      });
    });

    it('should throw UnauthorizedException when handicap card is not found', async () => {
      mocks.userRepository.findByHandicapCardId.mockResolvedValue(null);

      await expect(useCase.execute(HANDICAP_CARD_DTO)).rejects.toThrow(
        new UnauthorizedException('Invalid handicap card'),
      );

      expect(mocks.sendMagicLinkLoginUseCase.send).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when account is PENDING (email not confirmed)', async () => {
      mocks.userRepository.findByHandicapCardId.mockResolvedValue(
        makeUser(AccountStatus.PENDING),
      );

      await expect(useCase.execute(HANDICAP_CARD_DTO)).rejects.toThrow(
        new UnauthorizedException('Email not confirmed'),
      );

      expect(mocks.sendMagicLinkLoginUseCase.send).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when account is DISABLED', async () => {
      mocks.userRepository.findByHandicapCardId.mockResolvedValue(
        makeUser(AccountStatus.DISABLED),
      );

      await expect(useCase.execute(HANDICAP_CARD_DTO)).rejects.toThrow(
        new UnauthorizedException('Account inactive or suspended'),
      );

      expect(mocks.sendMagicLinkLoginUseCase.send).not.toHaveBeenCalled();
    });
  });

  describe('routing', () => {
    it('should route to handicap card login when dto contains handicapCardId', async () => {
      mocks.userRepository.findByHandicapCardId.mockResolvedValue(makeUser());

      await useCase.execute(HANDICAP_CARD_DTO);

      expect(mocks.userRepository.findByHandicapCardId).toHaveBeenCalledWith(
        MOCK_HANDICAP_CARD_ID,
      );
      expect(mocks.userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should route to email login when dto does not contain handicapCardId', async () => {
      mocks.userRepository.findByEmail.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await useCase.execute(EMAIL_DTO);

      expect(mocks.userRepository.findByEmail).toHaveBeenCalledWith(MOCK_EMAIL);
      expect(mocks.userRepository.findByHandicapCardId).not.toHaveBeenCalled();
    });
  });
});
