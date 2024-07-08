import { type MigrationInterface, type QueryRunner } from "typeorm";

export class PageExcerpt1657556946675 implements MigrationInterface {
  name = "PageExcerpt1657556946675";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "page" ADD "excerpt" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "excerpt"`);
  }
}
