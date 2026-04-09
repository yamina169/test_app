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
import { UserEntity } from './user.entity';
import { DocumentEntity } from './document.entity';
import {
  SubmissionStatus,
  SubmissionType,
} from '@domain/enums/submission.enum';

@Entity('submissions')
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status!: SubmissionStatus;

  @Column({
    type: 'enum',
    enum: SubmissionType,
    name: 'submission_type',
  })
  submissionType!: SubmissionType;

  @ManyToOne(() => UserEntity, (user) => user.submissions, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => DocumentEntity, (document) => document.submission)
  documents!: DocumentEntity[];
}
