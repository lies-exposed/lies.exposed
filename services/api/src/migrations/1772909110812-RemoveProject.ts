import { type MigrationInterface, type QueryRunner } from "typeorm";

export class RemoveProject1772909110812 implements MigrationInterface {
  name = "RemoveProject1772909110812";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop join table between project and media (created by RemoveProjectImage migration)
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_media_image" DROP CONSTRAINT IF EXISTS "FK_fcb364e553d9696508553e6be03"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_media_image" DROP CONSTRAINT IF EXISTS "FK_e69690817afc6b7636fdd0f74cd"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_fcb364e553d9696508553e6be0"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_e69690817afc6b7636fdd0f74c"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "project_media_image"`);

    // Drop join table between project and area
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_areas_area" DROP CONSTRAINT IF EXISTS "FK_ddbc42b34a83947249edda0f0cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_areas_area" DROP CONSTRAINT IF EXISTS "FK_62cafbc449a2411de7c264f0624"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_ddbc42b34a83947249edda0f0c"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_62cafbc449a2411de7c264f062"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "project_areas_area"`);

    // Drop legacy project_image join table (pre-RemoveProjectImage migration)
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_image" DROP CONSTRAINT IF EXISTS "FK_7b27cbd4456cc6313d8a476b32d"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "project_image" DROP CONSTRAINT IF EXISTS "FK_32cacd80729a4de8e11e92d20c1"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "project_image"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "project_image_kind_enum"`,
    );

    // Drop the project table itself
    await queryRunner.query(`DROP TABLE IF EXISTS "project"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_areas_area" ("projectId" uuid NOT NULL, "areaId" uuid NOT NULL, CONSTRAINT "PK_e43536251e50a9ea431b71f4e0a" PRIMARY KEY ("projectId", "areaId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62cafbc449a2411de7c264f062" ON "project_areas_area" ("projectId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddbc42b34a83947249edda0f0c" ON "project_areas_area" ("areaId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_62cafbc449a2411de7c264f0624" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_media_image" ("projectId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_3c0684469a957ee3451c347df19" PRIMARY KEY ("projectId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e69690817afc6b7636fdd0f74c" ON "project_media_image" ("projectId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcb364e553d9696508553e6be0" ON "project_media_image" ("imageId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_media_image" ADD CONSTRAINT "FK_e69690817afc6b7636fdd0f74cd" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_media_image" ADD CONSTRAINT "FK_fcb364e553d9696508553e6be03" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
