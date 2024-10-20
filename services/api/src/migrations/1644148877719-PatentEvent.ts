import { type MigrationInterface, type QueryRunner } from "typeorm";

export class PatentEvent1644148877719 implements MigrationInterface {
  name = "PatentEvent1644148877719";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."event_v2_type_enum" RENAME TO "event_v2_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum" AS ENUM('Death', 'ScientificStudy', 'Uncategorized', 'Patent')`,
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
    await queryRunner.query(
      `ALTER TABLE "group_member" ALTER COLUMN "startDate" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member" ALTER COLUMN "startDate" SET DEFAULT '2022-02-04 17:42:46.775569+00'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum_old" AS ENUM('Death', 'ScientificStudy', 'Uncategorized')`,
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
