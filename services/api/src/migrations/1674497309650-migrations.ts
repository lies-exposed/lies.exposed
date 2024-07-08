import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1674497309650 implements MigrationInterface {
  name = "migrations1674497309650";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_status_enum" AS ENUM('Pending', 'Approved', 'Declined')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "status" "public"."user_status_enum" NOT NULL  DEFAULT 'Pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
  }
}
