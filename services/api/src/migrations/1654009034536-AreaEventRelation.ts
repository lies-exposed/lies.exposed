import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AreaEventRelation1654009034536 implements MigrationInterface {
  name = "AreaEventRelation1654009034536";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "area" ADD "body" json`);
    await queryRunner.query(
      `CREATE TABLE "area_media_image" ("areaId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_d384347cda24d068466f74a98a3" PRIMARY KEY ("areaId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27e1cd7a7557f1b2fe536b088f" ON "area_media_image" ("areaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b86a8f26438b7598ecb3354c5f" ON "area_media_image" ("imageId") `,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "area" ADD "body" json`);
    await queryRunner.query(
      `ALTER TABLE "area_media_image" ADD CONSTRAINT "FK_27e1cd7a7557f1b2fe536b088f4" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "area_media_image" ADD CONSTRAINT "FK_b86a8f26438b7598ecb3354c5f1" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "area" ADD "body" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "area_media_image" DROP CONSTRAINT "FK_b86a8f26438b7598ecb3354c5f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area_media_image" DROP CONSTRAINT "FK_27e1cd7a7557f1b2fe536b088f4"`,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "area" ADD "body" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b86a8f26438b7598ecb3354c5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27e1cd7a7557f1b2fe536b088f"`,
    );
    await queryRunner.query(`DROP TABLE "area_media_image"`);
  }
}
