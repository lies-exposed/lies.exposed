import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AreaFeaturedImage1711133499689 implements MigrationInterface {
  name = "AreaFeaturedImage1711133499689";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "slug" SET DEFAULT 'uuid_generate_v4()'`,
    );
    await queryRunner.query(`ALTER TABLE "area" ADD "featuredImageId" uuid`);
    await queryRunner.query(`ALTER TABLE "event_v2" ADD "locationId" uuid`);

    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "FK_1363f4ea5857e41f7abfd5d93a4" FOREIGN KEY ("featuredImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2" ADD CONSTRAINT "FK_fda56b0fc841f27adb9006d3dd5" FOREIGN KEY ("locationId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "FK_1363f4ea5857e41f7abfd5d93a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ALTER COLUMN "slug" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "featuredImageId"`);

    await queryRunner.query(
      `ALTER TABLE "event_v2" DROP CONSTRAINT "FK_fda56b0fc841f27adb9006d3dd5"`,
    );
    await queryRunner.query(`ALTER TABLE "event_v2" DROP COLUMN "locationId"`);
  }
}
