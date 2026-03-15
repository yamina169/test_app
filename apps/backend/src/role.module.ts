import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@domain/entities/role.entity';
import { RoleRepository } from '@infrastructure/repositories/role.repository';
import { ROLE_REPOSITORY } from '@domain/interfaces/role.repository.interface'; // ← ajouter

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [
    {
      provide: ROLE_REPOSITORY, // ← 'IRoleRepository' → ROLE_REPOSITORY
      useClass: RoleRepository,
    },
  ],
  exports: [ROLE_REPOSITORY], // ← 'IRoleRepository' → ROLE_REPOSITORY
})
export class RoleModule {}
