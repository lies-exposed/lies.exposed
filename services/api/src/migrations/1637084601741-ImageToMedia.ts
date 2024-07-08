import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ImageToMedia1637084601741 implements MigrationInterface {
  name = "ImageToMedia1637084601741";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_media_image" ("eventId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_85c0b4beaec5fb10ed37831405f" PRIMARY KEY ("eventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7b8e04c55e14cb2639a226b59" ON "event_media_image" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_70d5c8cbba5293f626dfcf28f1" ON "event_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event_media_image" ("deathEventId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_0f376459fae712a41861189afa9" PRIMARY KEY ("deathEventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_910b167538ca218ab8d8bea0b4" ON "death_event_media_image" ("deathEventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_715406e6dc1a91d3b933bff9b0" ON "death_event_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."image_type_enum" AS ENUM('image/jpg', 'image/png', 'video/mp4')`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD "type" "public"."image_type_enum" NOT NULL DEFAULT 'image/jpg'`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" ADD CONSTRAINT "FK_e7b8e04c55e14cb2639a226b59a" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" ADD CONSTRAINT "FK_70d5c8cbba5293f626dfcf28f19" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_media_image" ADD CONSTRAINT "FK_910b167538ca218ab8d8bea0b42" FOREIGN KEY ("deathEventId") REFERENCES "death_event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_media_image" ADD CONSTRAINT "FK_715406e6dc1a91d3b933bff9b03" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "death_event_media_image" DROP CONSTRAINT "FK_715406e6dc1a91d3b933bff9b03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_media_image" DROP CONSTRAINT "FK_910b167538ca218ab8d8bea0b42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" DROP CONSTRAINT "FK_70d5c8cbba5293f626dfcf28f19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" DROP CONSTRAINT "FK_e7b8e04c55e14cb2639a226b59a"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."image_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_715406e6dc1a91d3b933bff9b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_910b167538ca218ab8d8bea0b4"`,
    );
    await queryRunner.query(`DROP TABLE "death_event_media_image"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_70d5c8cbba5293f626dfcf28f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e7b8e04c55e14cb2639a226b59"`,
    );
    await queryRunner.query(`DROP TABLE "event_media_image"`);
  }
}
