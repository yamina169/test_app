import { UseGuards } from '@nestjs/common';
import { Resolver, Args, ID, Mutation } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

import { SubmissionObjectType } from '@presentation/graphql/types/submission.type';
import { CreateSubmissionInput } from '@presentation/graphql/inputs/create-submission.input';
import { CreateSubmissionUseCase } from '@application/use-cases/submission/create-submission.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver(() => SubmissionObjectType)
export class SubmissionResolver {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => SubmissionObjectType)
  async createSubmission(
    @Args('userId', { type: (): GraphQLScalarType => ID as GraphQLScalarType })
    userId: string,
    @Args('input') input: CreateSubmissionInput,
  ): Promise<SubmissionObjectType> {
    return this.createSubmissionUseCase.execute(
      input,
      userId,
    ) as Promise<SubmissionObjectType>;
  }
}
