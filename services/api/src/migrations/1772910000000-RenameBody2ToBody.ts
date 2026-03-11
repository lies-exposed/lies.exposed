import { type MigrationInterface, type QueryRunner } from "typeorm";

export class RenameBody2ToBody1772910000000 implements MigrationInterface {
  name = "RenameBody2ToBody1772910000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Story: drop old varchar body, rename body2 (json) to body
    await queryRunner.query(`ALTER TABLE "story" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "story" RENAME COLUMN "body2" TO "body"`,
    );

    // Page: drop old varchar body, rename body2 (json) to body
    await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "page" RENAME COLUMN "body2" TO "body"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Page: reverse
    await queryRunner.query(
      `ALTER TABLE "page" RENAME COLUMN "body" TO "body2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page" ADD COLUMN "body" character varying`,
    );

    // Story: reverse
    await queryRunner.query(
      `ALTER TABLE "story" RENAME COLUMN "body" TO "body2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD COLUMN "body" character varying NOT NULL DEFAULT ''`,
    );
  }
}
