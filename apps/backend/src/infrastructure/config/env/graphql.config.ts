import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GraphQLError } from 'graphql';
import { join } from 'path';

export const graphQlConfig: Partial<ApolloDriverConfig> = {
  driver: ApolloDriver,
  path: '/api/graphql',
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  csrfPrevention: true,

  // Forwards Fastify req/res to resolvers and guards
  context: ({ req, res }: { req: FastifyRequest; res: FastifyReply }) => ({
    req,
    res,
  }),

  formatError: (error: GraphQLError) => ({
    message: error.message,
    code: error.extensions?.code,
    details: error.extensions?.originalError,
  }),
};
