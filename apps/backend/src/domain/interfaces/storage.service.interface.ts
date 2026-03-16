export interface IStorageService {
  uploadFile(
    file: Uint8Array,
    originalName: string,
    mimeType: string,
    submissionId: string,
  ): Promise<{ fileName: string; fileUrl: string }>;

  deleteFile(ref: string): Promise<void>;
}
