import { type MigrationInterface, type QueryRunner } from "typeorm";

export class StoryLinks1772500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "story_links_link" (
        "storyId" uuid NOT NULL,
        "linkId" uuid NOT NULL,
        CONSTRAINT "PK_story_links_link" PRIMARY KEY ("storyId", "linkId"),
        CONSTRAINT "FK_story_links_link_story" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_story_links_link_link" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_story_links_link_storyId" ON "story_links_link" ("storyId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_story_links_link_linkId" ON "story_links_link" ("linkId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "story_links_link"`);
  }
}
