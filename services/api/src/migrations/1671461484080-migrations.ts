import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1671461484080 implements MigrationInterface {
  name = "migrations1671461484080";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keyword_media_image" ("keywordId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_816310bf58f9350923cbdd0825a" PRIMARY KEY ("keywordId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c067afce4905d8b2e5253bbc4" ON "keyword_media_image" ("keywordId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_01d32169b431063ed651cc122c" ON "keyword_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_media_image" ADD CONSTRAINT "FK_3c067afce4905d8b2e5253bbc4d" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_media_image" ADD CONSTRAINT "FK_01d32169b431063ed651cc122c9" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_media_image" DROP CONSTRAINT "FK_01d32169b431063ed651cc122c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_media_image" DROP CONSTRAINT "FK_3c067afce4905d8b2e5253bbc4d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_01d32169b431063ed651cc122c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c067afce4905d8b2e5253bbc4"`,
    );
    await queryRunner.query(`DROP TABLE "keyword_media_image"`);
  }
}
