import { Role } from '@domain/entities/role.entity';

export interface IRoleRepository {
  findById(id: number): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<Role>;
  delete(id: number): Promise<Role | null>;
}
