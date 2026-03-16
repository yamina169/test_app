import { CreateDocumentUseCase } from './create-document.use-case';
import { Document } from '@domain/entities/document.entity';
import { DocumentType } from '@common/enums/document.enum';
import { IDocumentRepository } from '@domain/interfaces/document.repository.interface';
import { IStorageService } from '@domain/interfaces/storage.service.interface';
import { IUnitOfWork } from '@domain/interfaces/unit-of-work.interface';

const saveMock = jest.fn();
const uploadFileMock = jest.fn();
const deleteFileMock = jest.fn();
const uowSaveMock = jest.fn();

const mockDocumentRepository: jest.Mocked<IDocumentRepository> = {
  save: saveMock,
} as unknown as jest.Mocked<IDocumentRepository>;

const mockStorageService: jest.Mocked<IStorageService> = {
  uploadFile: uploadFileMock,
  deleteFile: deleteFileMock,
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
  fileName: 'proof.pdf',
  fileUrl: 'https://minio/proof.pdf',
  documentType: DocumentType.PROOF_OF_HANDICAP,
  submissionId: 'sub-1',
  createdAt: new Date(),
});

beforeEach(() => jest.clearAllMocks());

describe('CreateDocumentUseCase', () => {
  it('uploads file and saves document successfully', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'proof.pdf',
      fileUrl: 'https://minio/proof.pdf',
    });
    const saved = makeSavedDocument('doc-1');
    saveMock.mockResolvedValue(saved);

    const result = await makeUseCase().execute(
      file,
      DocumentType.PROOF_OF_HANDICAP,
      'sub-1',
    );

    expect(uploadFileMock).toHaveBeenCalledWith(
      file.buffer,
      file.fileName,
      file.mimeType,
      'sub-1',
    );
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('rolls back MinIO upload when DB save fails without uow', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'proof.pdf',
      fileUrl: 'https://minio/proof.pdf',
    });
    saveMock.mockRejectedValue(new Error('DB error'));
    deleteFileMock.mockResolvedValue(undefined);

    await expect(
      makeUseCase().execute(file, DocumentType.PROOF_OF_HANDICAP, 'sub-1'),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).toHaveBeenCalledWith('https://minio/proof.pdf');
  });

  it('rolls back MinIO even when uow is provided and DB save fails', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'proof.pdf',
      fileUrl: 'https://minio/proof.pdf',
    });
    uowSaveMock.mockRejectedValue(new Error('DB error'));
    deleteFileMock.mockResolvedValue(undefined);

    await expect(
      makeUseCase().execute(
        file,
        DocumentType.PROOF_OF_HANDICAP,
        'sub-1',
        mockUow,
      ),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).toHaveBeenCalledWith('https://minio/proof.pdf');
  });

  it('uses uow repository when uow is provided', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'proof.pdf',
      fileUrl: 'https://minio/proof.pdf',
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

  it('still throws original error even when MinIO rollback fails', async () => {
    uploadFileMock.mockResolvedValue({
      fileName: 'proof.pdf',
      fileUrl: 'https://minio/proof.pdf',
    });
    saveMock.mockRejectedValue(new Error('DB error'));
    deleteFileMock.mockRejectedValue(new Error('MinIO delete failed'));

    await expect(
      makeUseCase().execute(file, DocumentType.PROOF_OF_HANDICAP, 'sub-1'),
    ).rejects.toThrow('DB error');

    expect(deleteFileMock).toHaveBeenCalled();
  });
});
