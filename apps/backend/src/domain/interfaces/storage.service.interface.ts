import { UploadedFile } from './uploaded-file.interface';

export interface IStorageService {
  uploadFile(
    file: UploadedFile,
    submissionId?: string,
  ): Promise<{ fileName: string; fileUrl: string }>;

  deleteFile(ref: string): Promise<void>;
  fileExists(ref: string): Promise<boolean>;
}
