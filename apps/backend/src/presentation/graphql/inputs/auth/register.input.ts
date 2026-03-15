import { InputType, Field } from '@nestjs/graphql';
import { RegisterUserDto } from '@application/dto/auth/register.dto';
import { OccupationStatus } from '@common/enums/user.enum';

@InputType()
export class RegisterInput extends RegisterUserDto {
  @Field()
  declare full_name: string;

  @Field()
  declare email: string;

  @Field()
  declare phone: string;

  @Field()
  declare password: string;

  @Field()
  declare role_id: number;

  @Field({ nullable: true })
  declare date_of_birth?: string;

  @Field({ nullable: true })
  declare governorate?: string;

  @Field({ nullable: true })
  declare city?: string;

  @Field({ nullable: true })
  declare handicap_type?: string;

  @Field(() => [String], { nullable: true })
  declare required_accommodation?: string[];

  @Field(() => String, { nullable: true })
  declare occupation_status?: OccupationStatus;

  @Field({ nullable: true })
  declare caregiver?: boolean;

  @Field({ nullable: true })
  declare institution_name?: string;

  @Field({ nullable: true })
  declare institution_phone?: string;

  @Field({ nullable: true })
  declare institution_email?: string;

  @Field({ nullable: true })
  declare institution_governorate?: string;

  @Field({ nullable: true })
  declare institution_city?: string;

  @Field({ nullable: true })
  declare website?: string;

  @Field(() => [String], { nullable: true })
  declare type_of_services?: string[];

  @Field({ nullable: true })
  declare accessible?: boolean;

  @Field(() => [String], { nullable: true })
  declare specific_equipment?: string[];
}
