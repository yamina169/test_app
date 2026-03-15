import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773589478757 implements MigrationInterface {
  name = 'Migration1773589478757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "handicap_card_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "handicap_card_id"`,
    );
  }
}
