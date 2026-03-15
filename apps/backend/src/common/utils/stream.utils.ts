import { Readable } from 'stream';

/** Converts a readable stream into a Buffer  */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream)
    chunks.push(Buffer.from(chunk as ArrayBufferLike));
  return Buffer.concat(chunks);
}
