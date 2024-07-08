import { type MigrationInterface, type QueryRunner } from "typeorm";

export class DocumentaryEvent1646242242657 implements MigrationInterface {
  name = "DocumentaryEvent1646242242657";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_632d06b78600e438191d861756b"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."event_v2_type_enum" RENAME TO "event_v2_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum" AS ENUM('Death', 'ScientificStudy', 'Uncategorized', 'Patent', 'Documentary')`,
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
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_632d06b78600e438191d861756b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_632d06b78600e438191d861756b"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum_old" AS ENUM('Death', 'ScientificStudy', 'Uncategorized', 'Patent')`,
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
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_632d06b78600e438191d861756b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
