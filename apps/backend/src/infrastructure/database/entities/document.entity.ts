import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubmissionEntity } from './submission.entity';
import { DocumentType } from '@domain/enums/document.enum';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'enum', enum: DocumentType, name: 'document_type' })
  documentType: DocumentType;

  /** Optional association — a document can exist independently or be linked to a submission. */
  @ManyToOne(() => SubmissionEntity, (submission) => submission.documents, {
    nullable: true,
  })
  @JoinColumn({ name: 'submission_id' })
  submission?: SubmissionEntity | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
