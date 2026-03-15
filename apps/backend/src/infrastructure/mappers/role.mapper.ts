import { Role } from '@domain/entities/role.entity';
import { RoleEntity } from '@infrastructure/database/entities/role.entity';

export class RoleMapper {
  static toDomain(orm: RoleEntity): Role {
    return new Role(orm.id, orm.type, orm.createdAt, orm.updatedAt);
  }

  static toOrm(domain: Role): RoleEntity {
    const orm = new RoleEntity();
    orm.id = domain.id;
    orm.type = domain.type;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
