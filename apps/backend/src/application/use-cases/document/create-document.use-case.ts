import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import type { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import type { UploadedFile } from '@domain/interfaces/uploaded-file.interface';
import { Document } from '@domain/entities/document.entity';
import { DocumentType } from '@domain/enums/document.enum';

@Injectable()
export class CreateDocumentUseCase {
  private readonly logger = new Logger(CreateDocumentUseCase.name);

  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  /**
   * Uploads a file and saves its document record.
   *
   * @param uow - Optional transaction; caller handles rollback if provided.
   * @param submissionId - Scopes the file; defaults to 'standalone'.
   */
  async execute(
    file: UploadedFile,
    documentType: DocumentType,
    submissionId?: string,
    uow?: IUnitOfWork,
  ): Promise<Document> {
    const repo = uow?.documentRepository ?? this.documentRepository;

    const { fileName, fileUrl } = await this.storageService.uploadFile(
      file,
      submissionId ?? 'standalone',
    );

    const document = new Document(
      uuid(),
      fileName,
      fileUrl,
      documentType,
      submissionId ?? null,
      new Date(),
    );

    if (uow) {
      return repo.save(document);
    }

    try {
      return await repo.save(document);
    } catch (err) {
      this.logger.warn(`DB save failed — rolling back storage "${fileName}"`);
      await this.storageService
        .deleteFile(fileName)
        .catch((e) =>
          this.logger.error(`Rollback failed — "${fileName}" may remain`, e),
        );
      throw err;
    }
  }
}
