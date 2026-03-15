import { Resolver, Args, ID, Mutation } from '@nestjs/graphql';

import { SubmissionObjectType } from '@presentation/graphql/types/submission.type';
import { CreateSubmissionInput } from '@presentation/graphql/inputs/create-submission.input';
import { CreateSubmissionUseCase } from '@application/use-cases/submission/create-submission.use-case';

/** Handles submission-related GraphQL mutations. */
@Resolver(() => SubmissionObjectType)
export class SubmissionResolver {
  constructor(
    private readonly createSubmissionUseCase: CreateSubmissionUseCase,
  ) {}

  // TODO: Replace @Args('userId') with @CurrentUser() once auth is implemented.
  @Mutation(() => SubmissionObjectType)
  async createSubmission(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('input') input: CreateSubmissionInput,
  ): Promise<SubmissionObjectType> {
    return this.createSubmissionUseCase.execute(
      input,
      userId,
    ) as Promise<SubmissionObjectType>;
  }
}
