import { MigrationInterface, QueryRunner } from "typeorm";

export class MediaThumbnail1639209486926 implements MigrationInterface {
  name = "MediaThumbnail1639209486926";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" ADD "thumbnail" character varying`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."image_type_enum" RENAME TO "image_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum" AS ENUM('image/jpg', 'image/jpeg', 'image/png', 'video/mp4', 'application/pdf', 'iframe/video')`,
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
      `CREATE TYPE "public"."image_type_enum_old" AS ENUM('image/jpg', 'image/jpeg', 'image/png', 'video/mp4', 'application/pdf')`,
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
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "thumbnail"`);
  }
}
