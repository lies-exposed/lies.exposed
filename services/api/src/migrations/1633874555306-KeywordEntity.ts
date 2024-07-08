import { type MigrationInterface, type QueryRunner } from "typeorm";

export class KeywordEntity1633874555306 implements MigrationInterface {
  name = "KeywordEntity1633874555306";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keyword" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tag" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_affdb8c8fa5b442900cb3aa21dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5034b49799de7bd2acdea514fe" ON "keyword" ("tag") `,
    );
    await queryRunner.query(
      `CREATE TABLE "keyword_links_link" ("keywordId" uuid NOT NULL, "linkId" uuid NOT NULL, CONSTRAINT "PK_a77573ca17c025057d71132456c" PRIMARY KEY ("keywordId", "linkId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7c59b1a9fda24ca0ca9e0f58d" ON "keyword_links_link" ("keywordId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52cc73ace6e2630c6c92bb8718" ON "keyword_links_link" ("linkId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_keywords_keyword" ("eventId" uuid NOT NULL, "keywordId" uuid NOT NULL, CONSTRAINT "PK_96218d7ed8b195ce85b78a802ae" PRIMARY KEY ("eventId", "keywordId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_23e167516e1d91dcc9582d2b67" ON "event_keywords_keyword" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_584f9ac0825d83ba246430cebf" ON "event_keywords_keyword" ("keywordId") `,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "keywords"`);
    await queryRunner.query(`ALTER TABLE "link" ADD "image" character varying`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD "publishDate" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_links_link" ADD CONSTRAINT "FK_d7c59b1a9fda24ca0ca9e0f58db" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_links_link" ADD CONSTRAINT "FK_52cc73ace6e2630c6c92bb87180" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" ADD CONSTRAINT "FK_23e167516e1d91dcc9582d2b67f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" ADD CONSTRAINT "FK_584f9ac0825d83ba246430cebff" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" DROP CONSTRAINT "FK_584f9ac0825d83ba246430cebff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" DROP CONSTRAINT "FK_23e167516e1d91dcc9582d2b67f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_links_link" DROP CONSTRAINT "FK_52cc73ace6e2630c6c92bb87180"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_links_link" DROP CONSTRAINT "FK_d7c59b1a9fda24ca0ca9e0f58db"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "publishDate"`);
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "image"`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD "keywords" text NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_584f9ac0825d83ba246430cebf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_23e167516e1d91dcc9582d2b67"`,
    );
    await queryRunner.query(`DROP TABLE "event_keywords_keyword"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52cc73ace6e2630c6c92bb8718"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7c59b1a9fda24ca0ca9e0f58d"`,
    );
    await queryRunner.query(`DROP TABLE "keyword_links_link"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5034b49799de7bd2acdea514fe"`,
    );
    await queryRunner.query(`DROP TABLE "keyword"`);
  }
}
