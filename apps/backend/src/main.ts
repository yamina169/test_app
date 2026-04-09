import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { processRequest } from 'graphql-upload-ts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'http';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
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

  fastify.addHook(
    'preValidation',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const contentType = (request.headers['content-type'] as string) ?? '';
      if (!contentType.includes('multipart/form-data')) return;

      request.body = await processRequest(
        request.raw,
        reply.raw as ServerResponse,
      );
    },
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? '3001');
}

void bootstrap();
