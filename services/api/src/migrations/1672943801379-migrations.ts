import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1672943801379 implements MigrationInterface {
  name = "migrations1672943801379";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "UQ_8dece3c96270b99f144d26e4a7a" UNIQUE ("url")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "UQ_8dece3c96270b99f144d26e4a7a"`,
    );
  }
}
