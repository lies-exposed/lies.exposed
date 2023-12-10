import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { DeathEventEntity } from "#entities/archive/DeathEvent.entity.js";
import { EventEntity } from "#entities/archive/Event.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { ScientificStudyEntity } from "#entities/archive/ScientificStudy.entity.js";
import { MigrationInterface, QueryRunner } from "typeorm";

export class EventV21639419928672 implements MigrationInterface {
  name = "EventV21639419928672";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum" AS ENUM('Death', 'ScientificStudy', 'Uncategorized')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_v2" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "excerpt" json, "body" json, "draft" bool, "type" "public"."event_v2_type_enum" NOT NULL DEFAULT 'Uncategorized', "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a4b35dfde2e290d5978c0dc9828" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4b35dfde2e290d5978c0dc982" ON "event_v2" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_v2_links_link" ("eventV2Id" uuid NOT NULL, "linkId" uuid NOT NULL, CONSTRAINT "PK_aa4818a7edf5544ba635d2bbe52" PRIMARY KEY ("eventV2Id", "linkId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1b66e865afd0df322ce51f045c" ON "event_v2_links_link" ("eventV2Id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_12556a2d1b4a137b62a4252ea9" ON "event_v2_links_link" ("linkId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_v2_media_image" ("eventV2Id" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_796fd1f561aa75e4d8d96bc6555" PRIMARY KEY ("eventV2Id", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9e131ce1d4c24730c83e7b420f" ON "event_v2_media_image" ("eventV2Id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_830ccef27aabcd7cd040a287f4" ON "event_v2_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_v2_keywords_keyword" ("eventV2Id" uuid NOT NULL, "keywordId" uuid NOT NULL, CONSTRAINT "PK_29d0eea20ce05d57ba6da0a682d" PRIMARY KEY ("eventV2Id", "keywordId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57ac84768f13865a71586c1c84" ON "event_v2_keywords_keyword" ("eventV2Id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1512e830ee8f62ee6db969dc40" ON "event_v2_keywords_keyword" ("keywordId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" ADD CONSTRAINT "FK_1b66e865afd0df322ce51f045cf" FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" ADD CONSTRAINT "FK_12556a2d1b4a137b62a4252ea93" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" ADD CONSTRAINT "FK_9e131ce1d4c24730c83e7b420fc" FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" ADD CONSTRAINT "FK_830ccef27aabcd7cd040a287f49" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" ADD CONSTRAINT "FK_57ac84768f13865a71586c1c845" FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" ADD CONSTRAINT "FK_1512e830ee8f62ee6db969dc40b" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    const uncategorizedEvents = await queryRunner.manager
      .find(EventEntity, {
        loadRelationIds: {
          relations: [
            "actors",
            "groups",
            "groupsMembers",
            "media",
            "links",
            "keywords",
          ],
        },
      })
      .then((ee) =>
        ee.map(
          (e): EventV2Entity => ({
            ...(e as any),
            excerpt: {},
            body: (e.body2 as any) ?? {},
            draft: false,
            type: EventTypes.UNCATEGORIZED.value,
            payload: {
              title: e.title,
              location: undefined,
              endDate: e.endDate ?? undefined,
              actors: e.actors as any,
              groups: e.groups as any,
              groupsMembers: e.groupsMembers as any,
            },
            media: e.media as any[],
            keywords: e.keywords,
            date: e.startDate,
            links: e.links,
          }),
        ),
      );
    const deathEvents = await queryRunner.manager
      .find(DeathEventEntity, {
        loadRelationIds: {
          relations: ["victim"],
        },
      })
      .then((ss) =>
        ss.map(
          (s): EventV2Entity => ({
            ...(s as any),
            draft: false,
            excerpt: {},
            type: EventTypes.DEATH.value,
            payload: {
              location: (s as any).location ?? undefined,
              victim: s.victim as any,
            },
            body: {},
            media: [],
            keywords: [],
            links: [],
          }),
        ),
      );

    const scientificStudies = await queryRunner.manager
      .find(ScientificStudyEntity, {
        loadRelationIds: {
          relations: ["authors", "publisher"],
        },
      })
      .then((ss) =>
        ss.map(
          (s): EventV2Entity => ({
            ...(s as any),
            draft: false,
            type: EventTypes.SCIENTIFIC_STUDY.value,
            payload: {
              title: s.title,
              url: s.url as any,
              publisher: (s as any).publisher.id,
              image: undefined,
              authors: (s as any).authors as any[],
            },
            body: s.body2,
            keywords: [],
            media: [],
            excerpt: {},
            date: s.publishDate,
            links: [],
          }),
        ),
      );
    const eventsV2 = [
      ...uncategorizedEvents,
      ...deathEvents,
      ...scientificStudies,
    ];

    await queryRunner.manager.save(EventV2Entity, eventsV2);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" DROP CONSTRAINT "FK_1512e830ee8f62ee6db969dc40b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_keywords_keyword" DROP CONSTRAINT "FK_57ac84768f13865a71586c1c845"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" DROP CONSTRAINT "FK_830ccef27aabcd7cd040a287f49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_media_image" DROP CONSTRAINT "FK_9e131ce1d4c24730c83e7b420fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" DROP CONSTRAINT "FK_12556a2d1b4a137b62a4252ea93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_v2_links_link" DROP CONSTRAINT "FK_1b66e865afd0df322ce51f045cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1512e830ee8f62ee6db969dc40"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57ac84768f13865a71586c1c84"`,
    );
    await queryRunner.query(`DROP TABLE "event_v2_keywords_keyword"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_830ccef27aabcd7cd040a287f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9e131ce1d4c24730c83e7b420f"`,
    );
    await queryRunner.query(`DROP TABLE "event_v2_media_image"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_12556a2d1b4a137b62a4252ea9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1b66e865afd0df322ce51f045c"`,
    );
    await queryRunner.query(`DROP TABLE "event_v2_links_link"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4b35dfde2e290d5978c0dc982"`,
    );
    await queryRunner.query(`DROP TABLE "event_v2"`);
    await queryRunner.query(`DROP TYPE "public"."event_v2_type_enum"`);
  }
}
