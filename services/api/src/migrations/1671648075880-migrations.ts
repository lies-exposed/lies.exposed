import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1671648075880 implements MigrationInterface {
  name = "migrations1671648075880";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."event_v2_type_enum" RENAME TO "event_v2_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum" AS ENUM('Death', 'ScientificStudy', 'Uncategorized', 'Patent', 'Documentary', 'Transaction', 'Quote')`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" TYPE "public"."event_v2_type_enum" USING "type"::"text"::"public"."event_v2_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" SET DEFAULT 'Uncategorized'`,
    );
    await queryRunner.query(`DROP TYPE "public"."event_v2_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum_old" AS ENUM('Death', 'ScientificStudy', 'Uncategorized', 'Patent', 'Documentary', 'Transaction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" TYPE "public"."event_v2_type_enum_old" USING "type"::"text"::"public"."event_v2_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "type" SET DEFAULT 'Uncategorized'`,
    );
    await queryRunner.query(`DROP TYPE "public"."event_v2_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."event_v2_type_enum_old" RENAME TO "event_v2_type_enum"`,
    );
  }
}
