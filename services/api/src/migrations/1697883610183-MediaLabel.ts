import { type MigrationInterface, type QueryRunner } from "typeorm";

export class MediaLabel1697883610183 implements MigrationInterface {
  name = "MediaLabel1697883610183";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" ADD "label" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "label"`);
  }
}
