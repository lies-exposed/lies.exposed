import { type MigrationInterface, type QueryRunner } from "typeorm";

export class EventLink1630399879432 implements MigrationInterface {
  name = "EventLink1630399879432";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_links_link" ("eventId" uuid NOT NULL, "linkId" uuid NOT NULL, CONSTRAINT "PK_e8aba63be0f41e27b1df6d654a6" PRIMARY KEY ("eventId", "linkId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_678c2a6ff3b2873f6b122c7eaa" ON "event_links_link" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4b9fff131b55febfe8e5ee864" ON "event_links_link" ("linkId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" ADD CONSTRAINT "FK_678c2a6ff3b2873f6b122c7eaac" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" ADD CONSTRAINT "FK_f4b9fff131b55febfe8e5ee8642" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_f4b9fff131b55febfe8e5ee8642"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_678c2a6ff3b2873f6b122c7eaac"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_f4b9fff131b55febfe8e5ee864"`);
    await queryRunner.query(`DROP INDEX "IDX_678c2a6ff3b2873f6b122c7eaa"`);
    await queryRunner.query(`DROP TABLE "event_links_link"`);
  }
}
