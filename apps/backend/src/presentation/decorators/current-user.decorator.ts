import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): unknown => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: { user: unknown } }>().req;
    return req.user;
  },
);
