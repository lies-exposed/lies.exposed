import { type MigrationInterface, type QueryRunner } from "typeorm";

export class KeywordColorOptional1643650636035 implements MigrationInterface {
  name = "KeywordColorOptional1643650636035";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword" ADD "color" character varying(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" ALTER COLUMN "startDate" SET DEFAULT 'now()'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member" ALTER COLUMN "startDate" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "keyword" DROP COLUMN "color"`);
  }
}
