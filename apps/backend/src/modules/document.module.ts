import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentEntity } from '@infrastructure/database/entities/document.entity';
import { DocumentRepository } from '@infrastructure/repositories/document.repository';
import { CreateDocumentUseCase } from '@application/use-cases/document/create-document.use-case';
import { DocumentResolver } from '@presentation/resolvers/document.resolver';
import { MinioModule } from '@infrastructure/integrations/minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), MinioModule],
  providers: [
    { provide: 'IDocumentRepository', useClass: DocumentRepository },
    CreateDocumentUseCase,
    DocumentResolver,
  ],
  exports: ['IDocumentRepository', CreateDocumentUseCase],
})
export class DocumentModule {}
