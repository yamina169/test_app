import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import type { IStorageService } from '@domain/interfaces/storage.service.interface';
import type { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';
import type { UploadedFile } from '@domain/interfaces/uploaded-file.interface';
import { Document } from '@domain/entities/document.entity';
import { DocumentType } from '@common/enums/document.enum';

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
   * @param uow - Optional. When provided, the document is saved within the
   *              caller's transaction. When omitted, executes independently.
   */
  async execute(
    file: UploadedFile,
    documentType: DocumentType,
    submissionId: string,
    uow?: IUnitOfWork,
  ): Promise<Document> {
    const repo = uow?.documentRepository ?? this.documentRepository;

    const { fileName, fileUrl } = await this.storageService.uploadFile(
      file.buffer,
      file.fileName,
      file.mimeType,
      submissionId,
    );

    const document = new Document(
      uuid(),
      fileName,
      fileUrl,
      documentType,
      submissionId,
      new Date(),
    );

    try {
      return await repo.save(document);
    } catch (err) {
      this.logger.warn(`DB save failed — rolling back MinIO "${fileName}"`);
      await this.storageService
        .deleteFile(fileUrl)
        .catch((e) =>
          this.logger.error(`Rollback failed — "${fileUrl}" may remain`, e),
        );
      throw err;
    }
  }
}
