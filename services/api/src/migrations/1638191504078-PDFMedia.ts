import { type MigrationInterface, type QueryRunner } from "typeorm";

export class PDFMedia1638191504078 implements MigrationInterface {
  name = "PDFMedia1638191504078";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."image_type_enum" RENAME TO "image_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum" AS ENUM('image/jpg', 'image/png', 'video/mp4', 'application/pdf')`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" TYPE "public"."image_type_enum" USING "type"::"text"::"public"."image_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" SET DEFAULT 'image/jpg'`,
    );
    await queryRunner.query(`DROP TYPE "public"."image_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum_old" AS ENUM('image/jpg', 'image/png', 'video/mp4')`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" TYPE "public"."image_type_enum_old" USING "type"::"text"::"public"."image_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "type" SET DEFAULT 'image/jpg'`,
    );
    await queryRunner.query(`DROP TYPE "public"."image_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."image_type_enum_old" RENAME TO "image_type_enum"`,
    );
  }
}
