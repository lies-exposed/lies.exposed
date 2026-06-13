import { type MigrationInterface, type QueryRunner } from "typeorm";

export class QueueModelColumn1772910000001 implements MigrationInterface {
  name = "QueueModelColumn1772910000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "queue" ADD "model" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "model"`);
  }
}
