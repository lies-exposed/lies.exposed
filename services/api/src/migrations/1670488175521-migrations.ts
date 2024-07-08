import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1670488175521 implements MigrationInterface {
  name = "migrations1670488175521";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keyword_articles_article" ("keywordId" uuid NOT NULL, "articleId" uuid NOT NULL, CONSTRAINT "PK_83d3cd40cb2557c7eb3773dd9c0" PRIMARY KEY ("keywordId", "articleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d724b0b1ab96868a5ec9f1405" ON "keyword_articles_article" ("keywordId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_261d07d111d20998c6d2671a1d" ON "keyword_articles_article" ("articleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_articles_article" ADD CONSTRAINT "FK_0d724b0b1ab96868a5ec9f14055" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_articles_article" ADD CONSTRAINT "FK_261d07d111d20998c6d2671a1d1" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_articles_article" DROP CONSTRAINT "FK_261d07d111d20998c6d2671a1d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_articles_article" DROP CONSTRAINT "FK_0d724b0b1ab96868a5ec9f14055"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_261d07d111d20998c6d2671a1d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d724b0b1ab96868a5ec9f1405"`,
    );
    await queryRunner.query(`DROP TABLE "keyword_articles_article"`);
  }
}
