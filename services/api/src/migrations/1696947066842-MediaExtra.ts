import { type MigrationInterface, type QueryRunner } from "typeorm";

export class MediaExtra1696947066842 implements MigrationInterface {
  name = "MediaExtra1696947066842";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" ADD "extra" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "extra"`);
  }
}
