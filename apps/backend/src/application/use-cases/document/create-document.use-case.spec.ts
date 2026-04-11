import { CreateDocumentUseCase } from './create-document.use-case';
import { Document } from '@domain/entities/document.entity';
import { DocumentType } from '@domain/enums/document.enum';
import { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import { IStorageService } from '@domain/interfaces/storage.service.interface';
import { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';

const saveMock = jest.fn();
const uploadFileMock = jest.fn();
const deleteFileMock = jest.fn();
const uowSaveMock = jest.fn();
const fileExistsMock = jest.fn();

const mockDocumentRepository: jest.Mocked<IDocumentRepository> = {
  save: saveMock,
} as unknown as jest.Mocked<IDocumentRepository>;

const mockStorageService: jest.Mocked<IStorageService> = {
  uploadFile: uploadFileMock,
  deleteFile: deleteFileMock,
  fileExists: fileExistsMock,
};

const mockUow = {
  documentRepository: { save: uowSaveMock },
} as unknown as IUnitOfWork;

const makeUseCase = () =>
  new CreateDocumentUseCase(mockDocumentRepository, mockStorageService);

const file = {
  buffer: Buffer.from('test'),
  fileName: 'proof.pdf',
  mimeType: 'application/pdf',
};

const makeSavedDocument = (id: string): Document => ({
  id,
  fileName: 'sub-1/abc123.pdf',
  fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
  documentType: DocumentType.PROOF_OF_HANDICAP,
  submissionId: 'sub-1',
  createdAt: new Date(),
});

beforeEach(() => jest.clearAllMocks());

describe('CreateDocumentUseCase', () => {
  it('uploads file and saves document successfully', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'sub-1/abc123.pdf',
      fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
    });
    const saved = makeSavedDocument('doc-1');
    saveMock.mockResolvedValue(saved);

    const result = await makeUseCase().execute(
      file,
      DocumentType.PROOF_OF_HANDICAP,
      'sub-1',
    );

    expect(uploadFileMock).toHaveBeenCalledWith(file, 'sub-1');
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('falls back to "standalone" scope when submissionId is omitted', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'standalone/abc123.pdf',
      fileUrl: 'https://minio/bucket/standalone/abc123.pdf',
    });
    saveMock.mockResolvedValue(makeSavedDocument('doc-standalone'));

    await makeUseCase().execute(file, DocumentType.PROOF_OF_HANDICAP);

    expect(uploadFileMock).toHaveBeenCalledWith(file, 'standalone');
  });

  it('rolls back storage using fileName (objectKey) when DB save fails without uow', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'sub-1/abc123.pdf',
      fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
    });
    saveMock.mockRejectedValue(new Error('DB error'));
    deleteFileMock.mockResolvedValue(undefined);

    await expect(
      makeUseCase().execute(file, DocumentType.PROOF_OF_HANDICAP, 'sub-1'),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).toHaveBeenCalledWith('sub-1/abc123.pdf');
  });

  it('does NOT roll back storage when uow is provided — caller owns the rollback', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'sub-1/abc123.pdf',
      fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
    });
    uowSaveMock.mockRejectedValue(new Error('DB error'));

    await expect(
      makeUseCase().execute(
        file,
        DocumentType.PROOF_OF_HANDICAP,
        'sub-1',
        mockUow,
      ),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).not.toHaveBeenCalled();
  });

  it('uses uow repository when uow is provided', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'sub-1/abc123.pdf',
      fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
    });
    const saved = makeSavedDocument('doc-2');
    uowSaveMock.mockResolvedValue(saved);

    const result = await makeUseCase().execute(
      file,
      DocumentType.PROOF_OF_HANDICAP,
      'sub-1',
      mockUow,
    );

    expect(uowSaveMock).toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('still throws original error even when storage rollback fails', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'sub-1/abc123.pdf',
      fileUrl: 'https://minio/bucket/sub-1/abc123.pdf',
    });
    saveMock.mockRejectedValue(new Error('DB error'));
    deleteFileMock.mockRejectedValue(new Error('MinIO delete failed'));

    await expect(
      makeUseCase().execute(file, DocumentType.PROOF_OF_HANDICAP, 'sub-1'),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).toHaveBeenCalled();
  });
});
