import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1676808166725 implements MigrationInterface {
  name = "migrations1676808166725";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "group" ADD "startDate" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "group" ADD "endDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "endDate"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "startDate"`);
  }
}
