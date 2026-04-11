export const STORAGE_SERVICE_PORT = Symbol('IStorageService');

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
