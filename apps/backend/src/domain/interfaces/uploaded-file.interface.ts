import { DocumentType } from '../enums/document.enum';

export interface UploadedFile {
  buffer: Uint8Array;
  fileName: string;
  mimeType: string;
}

export type FileEntry = { file: UploadedFile; documentType: DocumentType };
