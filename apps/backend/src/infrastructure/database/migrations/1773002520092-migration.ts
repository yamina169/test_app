import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773002520092 implements MigrationInterface {
  name = 'Migration1773002520092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ff503f858b61860b2b7d7a55ceb" UNIQUE ("type"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."documents_document_type_enum" AS ENUM('PROOF_OF_HANDICAP', 'CAREGIVER_PROOF', 'IDENTITY_DOCUMENT', 'INSTITUTION_DOC', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "document_type" "public"."documents_document_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "submission_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."submissions_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."submissions_submission_type_enum" AS ENUM('REGISTRATION_HANDICAP_USER', 'REGISTRATION_INSTITUTION', 'HANDICAP_ID_CARD', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "status" "public"."submissions_status_enum" NOT NULL DEFAULT 'PENDING', "submission_type" "public"."submissions_submission_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING', 'ACTIVE', 'DISABLED', 'ARCHIVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_occupation_status_enum" AS ENUM('STUDENT', 'UNEMPLOYED', 'EMPLOYED', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password" character varying NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date_of_birth" date, "governorate" character varying, "city" character varying, "handicap_type" character varying, "required_accommodation" text array, "occupation_status" "public"."users_occupation_status_enum", "caregiver" boolean, "institution_name" character varying, "institution_phone" character varying, "institution_email" character varying, "institution_governorate" character varying, "institution_city" character varying, "website" character varying, "type_of_services" text array, "accessible" boolean, "specific_equipment" text array, "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_535832888bafc36dc0f05c26ea0" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD CONSTRAINT "FK_fca12c4ddd646dea4572c6815a9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_fca12c4ddd646dea4572c6815a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_535832888bafc36dc0f05c26ea0"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP TYPE "public"."users_occupation_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TABLE "submissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."submissions_submission_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."submissions_status_enum"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(
      `DROP TYPE "public"."documents_document_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
