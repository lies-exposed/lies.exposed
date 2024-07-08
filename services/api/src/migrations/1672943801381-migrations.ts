import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1672943801381 implements MigrationInterface {
  name = "migrations1672943801381";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "UQ_cc48323d43000dc682043798dc6" UNIQUE ("location")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "UQ_cc48323d43000dc682043798dc6"`,
    );
  }
}
