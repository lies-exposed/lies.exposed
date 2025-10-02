import { type MigrationInterface, type QueryRunner } from "typeorm";

export class RemoveProjectImage1759420319465 implements MigrationInterface {
  name = "RemoveProjectImage1759420319465";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_media_image" ("projectId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_3c0684469a957ee3451c347df19" PRIMARY KEY ("projectId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e69690817afc6b7636fdd0f74c" ON "project_media_image" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcb364e553d9696508553e6be0" ON "project_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_media_image" ADD CONSTRAINT "FK_e69690817afc6b7636fdd0f74cd" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_media_image" ADD CONSTRAINT "FK_fcb364e553d9696508553e6be03" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_media_image" DROP CONSTRAINT "FK_fcb364e553d9696508553e6be03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_media_image" DROP CONSTRAINT "FK_e69690817afc6b7636fdd0f74cd"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcb364e553d9696508553e6be0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e69690817afc6b7636fdd0f74c"`,
    );
    await queryRunner.query(`DROP TABLE "project_media_image"`);
  }
}
