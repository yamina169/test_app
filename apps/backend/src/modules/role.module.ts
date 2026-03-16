import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from '@infrastructure/database/entities/role.entity';
import { RoleRepository } from '@infrastructure/repositories/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [{ provide: 'IRoleRepository', useClass: RoleRepository }],
  exports: ['IRoleRepository'],
})
export class RoleModule {}
