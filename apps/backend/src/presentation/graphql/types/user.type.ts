import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AccountStatus, OccupationStatus } from '@common/enums/user.enum';

registerEnumType(AccountStatus, { name: 'AccountStatus' });
registerEnumType(OccupationStatus, { name: 'OccupationStatus' });

@ObjectType('HandicapProfile')
export class HandicapProfileType {
  @Field()
  dateOfBirth: Date;

  @Field()
  governorate: string;

  @Field()
  city: string;

  @Field()
  handicapType: string;

  @Field(() => [String])
  requiredAccommodation: string[];

  @Field(() => OccupationStatus)
  occupationStatus: OccupationStatus;

  @Field()
  caregiver: boolean;
}

@ObjectType('InstitutionProfile')
export class InstitutionProfileType {
  @Field()
  institutionName: string;

  @Field()
  institutionPhone: string;

  @Field()
  institutionEmail: string;

  @Field()
  institutionGovernorate: string;

  @Field()
  institutionCity: string;

  @Field()
  website: string;

  @Field(() => [String])
  typeOfServices: string[];

  @Field()
  accessible: boolean;

  @Field(() => [String])
  specificEquipment: string[];
}

@ObjectType('User')
export class UserObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => AccountStatus)
  status: AccountStatus;

  @Field()
  roleId: number;

  @Field(() => HandicapProfileType, { nullable: true })
  handicapProfile: HandicapProfileType | null;

  @Field(() => InstitutionProfileType, { nullable: true })
  institutionProfile: InstitutionProfileType | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
