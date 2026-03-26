import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { SubmissionEntity } from './submission.entity';
import { AccountStatus, OccupationStatus } from '@domain/enums/user.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING,
  })
  status: AccountStatus;

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Handicap profile fields
  @Column({ name: 'handicap_card_id', nullable: true })
  handicapCardId?: string;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  governorate?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true, name: 'handicap_type' })
  handicapType?: string;

  @Column('text', {
    array: true,
    nullable: true,
    name: 'required_accommodation',
  })
  requiredAccommodation?: string[];

  @Column({
    type: 'enum',
    enum: OccupationStatus,
    nullable: true,
    name: 'occupation_status',
  })
  occupationStatus?: OccupationStatus;

  @Column({ type: 'boolean', nullable: true })
  caregiver?: boolean;

  // Institution profile fields
  @Column({ nullable: true, name: 'institution_name' })
  institutionName?: string;

  @Column({ nullable: true, name: 'institution_phone' })
  institutionPhone?: string;

  @Column({ nullable: true, name: 'institution_email' })
  institutionEmail?: string;

  @Column({ nullable: true, name: 'institution_governorate' })
  institutionGovernorate?: string;

  @Column({ nullable: true, name: 'institution_city' })
  institutionCity?: string;

  @Column({ nullable: true })
  website?: string;

  @Column('text', { array: true, nullable: true, name: 'type_of_services' })
  typeOfServices?: string[];

  @Column({ type: 'boolean', nullable: true })
  accessible?: boolean;

  @Column('text', { array: true, nullable: true, name: 'specific_equipment' })
  specificEquipment?: string[];

  @OneToMany(() => SubmissionEntity, (submission) => submission.user)
  submissions: SubmissionEntity[];
}
