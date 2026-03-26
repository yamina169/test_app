import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IUserRepository } from '@domain/interfaces/user.repository.interface';
import { UserEntity } from '../database/entities/user.entity';
import { User } from '@domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  withRepo(repo: Repository<UserEntity>): UserRepository {
    return new UserRepository(repo);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find({ relations: ['role'] });
    return entities.map((e) => UserMapper.toDomain(e));
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toOrm(user);
    const saved = await this.repo.save(entity);

    const withRelations = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['role'],
    });

    if (!withRelations) throw new Error(`User with id ${saved.id} not found`);

    return UserMapper.toDomain(withRelations);
  }

  async delete(id: string): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.repo.delete(id);
    return existing;
  }
}
