import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IRoleRepository } from '@domain/interfaces/role.repository.interface';
import { RoleEntity } from '../database/entities/role.entity';
import { Role } from '@domain/entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
  ) {}

  async findById(id: number): Promise<Role | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    return RoleMapper.toDomain(entity);
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repo.find();
    return entities.map((e) => RoleMapper.toDomain(e));
  }

  async save(role: Role): Promise<Role> {
    const entity = RoleMapper.toOrm(role);
    const saved = await this.repo.save(entity);

    const fresh = await this.repo.findOne({ where: { id: saved.id } });
    if (!fresh)
      throw new NotFoundException(`Role with id ${saved.id} not found`);

    return RoleMapper.toDomain(fresh);
  }

  async delete(id: number): Promise<Role | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.repo.delete(id);
    return existing;
  }
}
