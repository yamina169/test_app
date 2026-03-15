import { CreateDocumentDto } from '@application/dto/document/create-document.dto';

/**
 * Represents the data needed to upload a document.
 * - buffer: file content in memory
 * - mimetype: type of the file
 */
export interface DocumentUploadInput {
  dto: CreateDocumentDto;
  file: {
    buffer: Buffer;
    mimetype: string;
    file_name: string;
  };
}
