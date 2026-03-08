import { type MigrationInterface, type QueryRunner } from "typeorm";

/**
 * Drop all tables that have no corresponding TypeORM entity.
 *
 * These are left-overs from two historical refactors:
 *  1. `event` → `event_v2`  (old event model + its junction tables)
 *  2. Removal of `article`, `scientific_study`, and `death_event` entity types
 *
 * Junction tables are dropped first to respect FK constraints, then the
 * primary tables.  The subsequent migration (RenameEventV2ToEvent1772700000000)
 * handles renaming `event_v2` → `event` once the old `event` table is gone.
 */
export class DropOrphanTables1772600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Junction / relation tables ────────────────────────────────────────
    // death_event relations
    await queryRunner.query(
      `DROP TABLE IF EXISTS "death_event_suspected_groups_members_group_member"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "death_event_subspected_groups_group"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "death_event_supsected_actors_actor"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "death_event_images_image"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "death_event_media_image"`);

    // old event relations
    await queryRunner.query(`DROP TABLE IF EXISTS "event_actors_actor"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "event_group_members_group_member"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "event_groups_group"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "event_groups_members_group_member"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "event_images_image"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_keywords_keyword"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_links_link"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_media_image"`);

    // article / scientific_study relations
    await queryRunner.query(`DROP TABLE IF EXISTS "keyword_articles_article"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "scientific_study_authors_actor"`,
    );

    // old event_link join-entity table
    await queryRunner.query(`DROP TABLE IF EXISTS "event_link"`);

    // ── Primary orphan tables ─────────────────────────────────────────────
    await queryRunner.query(`DROP TABLE IF EXISTS "death_event"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "article"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scientific_study"`);

    // duplicate of `page` (wrong plural name, never referenced by any entity)
    await queryRunner.query(`DROP TABLE IF EXISTS "pages"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore primary orphan tables (minimal schema – columns recreated from
    // the last known migration that touched them).  This is intentionally
    // sparse: these tables are considered dead data; the down migration exists
    // only to make the migration reversible in dev without data loss.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "title"       varchar     NOT NULL,
        "body"        text        NOT NULL,
        "path"        varchar     NOT NULL,
        "createdAt"   timestamp   NOT NULL DEFAULT now(),
        "updatedAt"   timestamp   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "article" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "title"       varchar     NOT NULL,
        "path"        varchar     NOT NULL,
        "body"        text        NOT NULL,
        "date"        date,
        "author"      varchar,
        "source"      varchar,
        "featuredImage" varchar,
        "draft"       boolean     NOT NULL DEFAULT true,
        "createdAt"   timestamp   NOT NULL DEFAULT now(),
        "updatedAt"   timestamp   NOT NULL DEFAULT now(),
        "deletedAt"   timestamp,
        CONSTRAINT "PK_article" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "keyword_articles_article" (
        "keywordId"  uuid NOT NULL,
        "articleId"  uuid NOT NULL,
        CONSTRAINT "PK_keyword_articles_article" PRIMARY KEY ("keywordId", "articleId"),
        CONSTRAINT "FK_keyword_articles_article_keyword" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_keyword_articles_article_article" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scientific_study" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "title"       varchar     NOT NULL,
        "url"         varchar     NOT NULL,
        "publishDate" date,
        "description" text,
        "publisher"   varchar,
        "image"       varchar,
        "draft"       boolean     NOT NULL DEFAULT true,
        "createdAt"   timestamp   NOT NULL DEFAULT now(),
        "updatedAt"   timestamp   NOT NULL DEFAULT now(),
        "deletedAt"   timestamp,
        CONSTRAINT "PK_scientific_study" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scientific_study_authors_actor" (
        "scientificStudyId"  uuid NOT NULL,
        "actorId"            uuid NOT NULL,
        CONSTRAINT "PK_scientific_study_authors_actor" PRIMARY KEY ("scientificStudyId", "actorId"),
        CONSTRAINT "FK_scientific_study_authors_actor_study"  FOREIGN KEY ("scientificStudyId") REFERENCES "scientific_study"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_scientific_study_authors_actor_actor"  FOREIGN KEY ("actorId")           REFERENCES "actor"("id")            ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "title"       varchar,
        "type"        varchar     NOT NULL,
        "payload"     jsonb       NOT NULL DEFAULT '{}',
        "date"        date        NOT NULL,
        "draft"       boolean     NOT NULL DEFAULT true,
        "excerpt"     text,
        "createdAt"   timestamp   NOT NULL DEFAULT now(),
        "updatedAt"   timestamp   NOT NULL DEFAULT now(),
        "deletedAt"   timestamp,
        CONSTRAINT "PK_event_legacy" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid, "linkId" uuid, "publishDate" date, "draft" boolean NOT NULL DEFAULT true, "deletedAt" timestamp, CONSTRAINT "PK_event_link" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_actors_actor"            ("eventId" uuid NOT NULL, "actorId"       uuid NOT NULL, CONSTRAINT "PK_event_actors_actor"            PRIMARY KEY ("eventId", "actorId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_group_members_group_member" ("eventId" uuid NOT NULL, "groupMemberId" uuid NOT NULL, CONSTRAINT "PK_event_group_members_group_member" PRIMARY KEY ("eventId", "groupMemberId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_groups_group"            ("eventId" uuid NOT NULL, "groupId"       uuid NOT NULL, CONSTRAINT "PK_event_groups_group"            PRIMARY KEY ("eventId", "groupId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_groups_members_group_member" ("eventId" uuid NOT NULL, "groupMemberId" uuid NOT NULL, CONSTRAINT "PK_event_groups_members_group_member" PRIMARY KEY ("eventId", "groupMemberId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_images_image"            ("eventId" uuid NOT NULL, "imageId"       uuid NOT NULL, CONSTRAINT "PK_event_images_image"            PRIMARY KEY ("eventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_keywords_keyword"        ("eventId" uuid NOT NULL, "keywordId"     uuid NOT NULL, CONSTRAINT "PK_event_keywords_keyword"        PRIMARY KEY ("eventId", "keywordId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_links_link"              ("eventId" uuid NOT NULL, "linkId"        uuid NOT NULL, CONSTRAINT "PK_event_links_link"              PRIMARY KEY ("eventId", "linkId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "event_media_image"             ("eventId" uuid NOT NULL, "imageId"       uuid NOT NULL, CONSTRAINT "PK_event_media_image"             PRIMARY KEY ("eventId", "imageId"))`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "death_event" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "payload"     jsonb       NOT NULL DEFAULT '{}',
        "date"        date        NOT NULL,
        "draft"       boolean     NOT NULL DEFAULT true,
        "createdAt"   timestamp   NOT NULL DEFAULT now(),
        "updatedAt"   timestamp   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_death_event" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "death_event_images_image"                          ("deathEventId" uuid NOT NULL, "imageId"       uuid NOT NULL, CONSTRAINT "PK_death_event_images_image"                          PRIMARY KEY ("deathEventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "death_event_media_image"                           ("deathEventId" uuid NOT NULL, "imageId"       uuid NOT NULL, CONSTRAINT "PK_death_event_media_image"                           PRIMARY KEY ("deathEventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "death_event_subspected_groups_group"               ("deathEventId" uuid NOT NULL, "groupId"       uuid NOT NULL, CONSTRAINT "PK_death_event_subspected_groups_group"               PRIMARY KEY ("deathEventId", "groupId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "death_event_supsected_actors_actor"                ("deathEventId" uuid NOT NULL, "actorId"       uuid NOT NULL, CONSTRAINT "PK_death_event_supsected_actors_actor"                PRIMARY KEY ("deathEventId", "actorId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "death_event_suspected_groups_members_group_member" ("deathEventId" uuid NOT NULL, "groupMemberId" uuid NOT NULL, CONSTRAINT "PK_death_event_suspected_groups_members_group_member" PRIMARY KEY ("deathEventId", "groupMemberId"))`,
    );
  }
}
