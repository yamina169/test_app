import { User } from '@domain/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByHandicapCardId(handicapCardId: string): Promise<User | null>;

  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<User | null>;
  saveOtp(userId: string, code: string, expiresAt: Date): Promise<void>;
  clearOtp(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
