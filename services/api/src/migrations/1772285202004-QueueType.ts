import { type MigrationInterface, type QueryRunner } from "typeorm";

export class QueueType1772285202004 implements MigrationInterface {
  name = "QueueType1772285202004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists: tableExists }] = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'story_links_link')`,
    );

    if (tableExists) {
      await queryRunner.query(
        `ALTER TABLE "story_links_link" DROP CONSTRAINT IF EXISTS "FK_story_links_link_story"`,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" DROP CONSTRAINT IF EXISTS "FK_story_links_link_link"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "public"."IDX_story_links_link_linkId"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "public"."IDX_story_links_link_storyId"`,
      );
    }

    await queryRunner.query(
      `ALTER TYPE "public"."queue_type_enum" RENAME TO "queue_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."queue_type_enum" AS ENUM('openai-embedding', 'openai-summarize', 'openai-create-event-from-url', 'openai-create-event-from-text', 'openai-create-event-from-links', 'openai-update-event', 'openai-update-entities-from-url')`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" TYPE "public"."queue_type_enum" USING "type"::"text"::"public"."queue_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" SET DEFAULT 'openai-embedding'`,
    );
    await queryRunner.query(`DROP TYPE "public"."queue_type_enum_old"`);

    if (tableExists) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_994a57d687cdb9643b7bffd93a" ON "story_links_link" ("storyId") `,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_3828d8763765d985071498a70d" ON "story_links_link" ("linkId") `,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" ADD CONSTRAINT "FK_994a57d687cdb9643b7bffd93ae" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" ADD CONSTRAINT "FK_3828d8763765d985071498a70d8" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ exists: tableExists }] = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'story_links_link')`,
    );

    if (tableExists) {
      await queryRunner.query(
        `ALTER TABLE "story_links_link" DROP CONSTRAINT IF EXISTS "FK_3828d8763765d985071498a70d8"`,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" DROP CONSTRAINT IF EXISTS "FK_994a57d687cdb9643b7bffd93ae"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "public"."IDX_3828d8763765d985071498a70d"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "public"."IDX_994a57d687cdb9643b7bffd93a"`,
      );
    }

    await queryRunner.query(
      `CREATE TYPE "public"."queue_type_enum_old" AS ENUM('openai-embedding', 'openai-summarize', 'openai-create-event-from-url', 'openai-create-event-from-text', 'openai-create-event-from-links', 'openai-update-event')`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" TYPE "public"."queue_type_enum_old" USING "type"::"text"::"public"."queue_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "queue" ALTER COLUMN "type" SET DEFAULT 'openai-embedding'`,
    );
    await queryRunner.query(`DROP TYPE "public"."queue_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."queue_type_enum_old" RENAME TO "queue_type_enum"`,
    );

    if (tableExists) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_story_links_link_storyId" ON "story_links_link" ("storyId") `,
      );
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_story_links_link_linkId" ON "story_links_link" ("linkId") `,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" ADD CONSTRAINT "FK_story_links_link_link" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "story_links_link" ADD CONSTRAINT "FK_story_links_link_story" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }
}
