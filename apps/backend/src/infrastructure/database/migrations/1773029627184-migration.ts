import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773029627184 implements MigrationInterface {
  name = 'Migration1773029627184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_2d3274032fbfa1e9de14a3ccd4d"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "card_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "card_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_2d3274032fbfa1e9de14a3ccd4d" UNIQUE ("card_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_2d3274032fbfa1e9de14a3ccd4d"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "card_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "card_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_2d3274032fbfa1e9de14a3ccd4d" UNIQUE ("card_id")`,
    );
  }
}
