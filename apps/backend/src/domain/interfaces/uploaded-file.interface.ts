export interface UploadedFile {
  buffer: Uint8Array; /** Raw binary content of the file. */
  fileName: string;
  mimeType: string;
}
