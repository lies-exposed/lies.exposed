import { type MigrationInterface, type QueryRunner } from "typeorm";

export class LinkStatus1769885107295 implements MigrationInterface {
  name = "LinkStatus1769885107295";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."link_status_enum" AS ENUM('DRAFT', 'APPROVED', 'UNAPPROVED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD "status" "public"."link_status_enum" NOT NULL DEFAULT 'DRAFT'`,
    );
    await queryRunner.query(
      `UPDATE "link" SET "status" = 'APPROVED' WHERE "publishDate" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."link_status_enum"`);
  }
}
