import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { FastifyReply, FastifyRequest } from 'fastify';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { GraphQLUpload } from 'graphql-upload-ts';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
const logger = new Logger('GraphQL');

@Injectable()
export class GraphqlConfig implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      csrfPrevention: true,
      buildSchemaOptions: {
        scalarsMap: [{ type: () => GraphQLUpload, scalar: GraphQLUpload }],
      },
      context: ({ req, res }: { req: FastifyRequest; res: FastifyReply }) => ({
        req,
        res,
      }),
      formatError: (formattedError: GraphQLFormattedError, error: unknown) => {
        logger.error('GraphQL Error', error);

        const gqlError = error instanceof GraphQLError ? error : null;
        const code = formattedError.extensions?.code || 'INTERNAL_ERROR';
        const isUserError = code === 'BAD_USER_INPUT';

        const safeError = {
          message: isUserError
            ? formattedError.message
            : 'Internal server error',
          code,
        };

        if (process.env.NODE_ENV !== 'production') {
          return {
            ...safeError,
            debug: gqlError?.message ?? formattedError.message,
          };
        }

        return safeError;
      },
    };
  }
}
