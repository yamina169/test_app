import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { processRequest } from 'graphql-upload-ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 50_000_000 }),
  );

  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addContentTypeParser(
    'multipart/form-data',
    (
      _request: FastifyRequest,
      _payload: IncomingMessage,
      done: (err: Error | null, body?: unknown) => void,
    ) => {
      done(null);
    },
  );

  /** Processes GraphQL file uploads before route validation.*/
  fastify.addHook(
    'preValidation',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const contentType = request.headers['content-type'] ?? '';
      if (!contentType.includes('multipart/form-data')) return;

      request.body = await processRequest(
        request.raw,
        reply.raw as ServerResponse,
        {
          maxFileSize: 10_000_000,
          maxFiles: 10,
        },
      );
    },
  );

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
  });

  await app.listen(config.getOrThrow<number>('BACKEND_PORT'), '0.0.0.0');
}

void bootstrap();
