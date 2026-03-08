import { type MigrationInterface, type QueryRunner } from "typeorm";

/**
 * Rename `event_v2` → `event` (and its junction tables) now that the old
 * `event` table has been dropped by the previous migration.
 *
 * Steps performed in `up`:
 *  1. Drop FK constraints on junction tables that reference `event_v2`.
 *  2. Rename the junction tables themselves.
 *  3. Rename the join-column in each junction table (`eventV2Id` → `eventId`).
 *  4. Rename the primary table `event_v2` → `event`.
 *  5. Re-create FK constraints under new names.
 *  6. Rename indexes to keep names consistent.
 *
 * Affected tables:
 *  - event_v2                → event
 *  - event_v2_keywords_keyword → event_keywords_keyword
 *  - event_v2_links_link       → event_links_link
 *  - event_v2_media_image      → event_media_image
 *  - story_events_event_v2     → story_events_event   (column: eventV2Id → eventId)
 */
export class RenameEventV2ToEvent1772700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Drop FKs referencing event_v2 on junction tables ──────────────
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" DROP CONSTRAINT "FK_57ac84768f13865a71586c1c845"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" DROP CONSTRAINT "FK_1b66e865afd0df322ce51f045cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" DROP CONSTRAINT "FK_9e131ce1d4c24730c83e7b420fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" DROP CONSTRAINT "FK_a4d7604cc22cebdecc36241a73d"`,
    );

    // ── 2. Rename junction tables ─────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" RENAME TO "event_keywords_keyword"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" RENAME TO "event_links_link"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" RENAME TO "event_media_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" RENAME TO "story_events_event"`,
    );

    // ── 3. Rename join-column in each junction table ──────────────────────
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" RENAME COLUMN "eventV2Id" TO "eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" RENAME COLUMN "eventV2Id" TO "eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" RENAME COLUMN "eventV2Id" TO "eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event" RENAME COLUMN "eventV2Id" TO "eventId"`,
    );

    // ── 4. Rename primary table event_v2 → event ─────────────────────────
    await queryRunner.query(`ALTER TABLE "event_v2" RENAME TO "event"`);

    // ── 5. Re-create FK constraints pointing to the renamed primary table ─
    await queryRunner.query(`
      ALTER TABLE "event_keywords_keyword"
        ADD CONSTRAINT "FK_event_keywords_keyword_eventId"
        FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "event_links_link"
        ADD CONSTRAINT "FK_event_links_link_eventId"
        FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "event_media_image"
        ADD CONSTRAINT "FK_event_media_image_eventId"
        FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "story_events_event"
        ADD CONSTRAINT "FK_story_events_event_eventId"
        FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ── 6. Rename indexes ─────────────────────────────────────────────────
    // event_keywords_keyword
    await queryRunner.query(
      `ALTER INDEX "IDX_57ac84768f13865a71586c1c84" RENAME TO "IDX_event_keywords_keyword_eventId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_1512e830ee8f62ee6db969dc40" RENAME TO "IDX_event_keywords_keyword_keywordId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_29d0eea20ce05d57ba6da0a682d" RENAME TO "PK_event_keywords_keyword"`,
    );

    // event_links_link
    await queryRunner.query(
      `ALTER INDEX "IDX_1b66e865afd0df322ce51f045c" RENAME TO "IDX_event_links_link_eventId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_12556a2d1b4a137b62a4252ea9" RENAME TO "IDX_event_links_link_linkId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_aa4818a7edf5544ba635d2bbe52" RENAME TO "PK_event_links_link"`,
    );

    // event_media_image
    await queryRunner.query(
      `ALTER INDEX "IDX_9e131ce1d4c24730c83e7b420f" RENAME TO "IDX_event_media_image_eventId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_830ccef27aabcd7cd040a287f4" RENAME TO "IDX_event_media_image_imageId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_796fd1f561aa75e4d8d96bc6555" RENAME TO "PK_event_media_image"`,
    );

    // story_events_event
    await queryRunner.query(
      `ALTER INDEX "IDX_a4d7604cc22cebdecc36241a73" RENAME TO "IDX_story_events_event_eventId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_df5d29e531027ea361f5b05607" RENAME TO "IDX_story_events_event_storyId"`,
    );

    // event primary key index
    await queryRunner.query(
      `ALTER INDEX "PK_a4b35dfde2e290d5978c0dc9828" RENAME TO "PK_event"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Reverse index renames ─────────────────────────────────────────────
    await queryRunner.query(
      `ALTER INDEX "PK_event" RENAME TO "PK_a4b35dfde2e290d5978c0dc9828"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_story_events_event_storyId" RENAME TO "IDX_df5d29e531027ea361f5b05607"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_story_events_event_eventId" RENAME TO "IDX_a4d7604cc22cebdecc36241a73"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_media_image_imageId" RENAME TO "IDX_830ccef27aabcd7cd040a287f4"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_media_image_eventId" RENAME TO "IDX_9e131ce1d4c24730c83e7b420f"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_event_media_image" RENAME TO "PK_796fd1f561aa75e4d8d96bc6555"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_links_link_linkId" RENAME TO "IDX_12556a2d1b4a137b62a4252ea9"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_links_link_eventId" RENAME TO "IDX_1b66e865afd0df322ce51f045c"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_event_links_link" RENAME TO "PK_aa4818a7edf5544ba635d2bbe52"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_keywords_keyword_keywordId" RENAME TO "IDX_1512e830ee8f62ee6db969dc40"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_event_keywords_keyword_eventId" RENAME TO "IDX_57ac84768f13865a71586c1c84"`,
    );
    await queryRunner.query(
      `ALTER INDEX "PK_event_keywords_keyword" RENAME TO "PK_29d0eea20ce05d57ba6da0a682d"`,
    );

    // ── Drop new FKs ──────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "story_events_event" DROP CONSTRAINT "FK_story_events_event_eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" DROP CONSTRAINT "FK_event_media_image_eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_event_links_link_eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" DROP CONSTRAINT "FK_event_keywords_keyword_eventId"`,
    );

    // ── Rename primary table back ─────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "event" RENAME TO "event_v2"`);

    // ── Rename join-columns back ──────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "story_events_event" RENAME COLUMN "eventId" TO "eventV2Id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" RENAME COLUMN "eventId" TO "eventV2Id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" RENAME COLUMN "eventId" TO "eventV2Id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" RENAME COLUMN "eventId" TO "eventV2Id"`,
    );

    // ── Rename junction tables back ───────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "story_events_event" RENAME TO "story_events_event_v2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_media_image" RENAME TO "event_v2_media_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" RENAME TO "event_v2_links_link"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_keywords_keyword" RENAME TO "event_v2_keywords_keyword"`,
    );

    // ── Restore original FK constraints ───────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "event_v2_keywords_keyword"
        ADD CONSTRAINT "FK_57ac84768f13865a71586c1c845"
        FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "event_v2_links_link"
        ADD CONSTRAINT "FK_1b66e865afd0df322ce51f045cf"
        FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "event_v2_media_image"
        ADD CONSTRAINT "FK_9e131ce1d4c24730c83e7b420fc"
        FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "story_events_event_v2"
        ADD CONSTRAINT "FK_a4d7604cc22cebdecc36241a73d"
        FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }
}
