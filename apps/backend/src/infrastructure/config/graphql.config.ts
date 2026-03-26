import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('GraphQL');

export const graphQlConfig: Partial<ApolloDriverConfig> = {
  driver: ApolloDriver,
  path: '/api/graphql',
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  csrfPrevention: true,

  /**
   * GraphQL context to forward Fastify req/res to resolvers and guards
   */
  context: ({ req, res }: { req: FastifyRequest; res: FastifyReply }) => ({
    req,
    res,
  }),

  /**
   * Secure GraphQL error handling
   * - Full logging on server side
   * - Do NOT expose originalError or stack trace to client
   * - Differentiate user errors (BAD_USER_INPUT) from internal errors
   * - In dev, add debug field for easier debugging
   */
  formatError: (error: GraphQLError) => {
    logger.error('GraphQL Error', error);

    const isUserError = error.extensions?.code === 'BAD_USER_INPUT';

    const safeError = {
      message: isUserError ? error.message : 'Internal server error',
      code: error.extensions?.code || 'INTERNAL_ERROR',
    };

    if (process.env.NODE_ENV !== 'production') {
      return { ...safeError, debug: error.message };
    }

    return safeError;
  },
};
