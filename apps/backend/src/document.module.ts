import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from '@domain/entities/document.entity';
import { Submission } from '@domain/entities/submission.entity';
import { DocumentRepository } from '@infrastructure/repositories/document.repository';
import { SubmissionRepository } from '@infrastructure/repositories/submission.repository';
import { CreateDocumentUseCase } from '@application/use-cases/document/create-document.use-case';
import { DocumentResolver } from '@presentation/resolvers/document.resolver';
import { MinioModule } from '@infrastructure/storage/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Submission]), MinioModule],
  providers: [
    { provide: 'IDocumentRepository', useClass: DocumentRepository },
    { provide: 'ISubmissionRepository', useClass: SubmissionRepository },
    CreateDocumentUseCase,
    DocumentResolver,
  ],
  exports: ['IDocumentRepository', CreateDocumentUseCase],
})
export class DocumentModule {}
