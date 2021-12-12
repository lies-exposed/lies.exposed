import { DeathType } from "@econnessione/shared/io/http/Events/Death";
import { ScientificStudyType } from "@econnessione/shared/io/http/Events/ScientificStudy";
import { UncategorizedType } from "@econnessione/shared/io/http/Events/Uncategorized";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { EventEntity } from "@entities/Event.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class EventV21639330033915 implements MigrationInterface {
  name = "EventV21639330033915";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_v2_type_enum" AS ENUM('Death', 'ScientificStudy', 'Uncategorized')`
    );
    await queryRunner.query(
      `CREATE TABLE "event_v2" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "excerpt" json, "type" "public"."event_v2_type_enum" NOT NULL DEFAULT 'Uncategorized', "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a4b35dfde2e290d5978c0dc9828" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4b35dfde2e290d5978c0dc982" ON "event_v2" ("id") `
    );

    const uncategorizedEvents = await queryRunner.manager
      .find(EventEntity, {
        relations: [
          "actors",
          "groups",
          "groupsMembers",
          "media",
          "links",
          "keywords",
        ],
      })
      .then((ee) =>
        ee.map(
          (e): EventV2Entity => ({
            ...e,
            excerpt: {},
            type: UncategorizedType.value,
            payload: {
              title: e.title,
              location: undefined,
              endDate: e.endDate ?? undefined,
              actors: e.actors.map((a) => a.id as any),
              groups: e.groups.map((g) => g.id as any),
              groupsMembers: e.groupsMembers.map((gm) => gm.id as any),
              links: e.links.map((l) => l.id as any),
              media: e.media.map((m) => m.id as any),
              keywords: e.keywords.map((k) => k.id as any),
            },
            date: e.startDate,
          })
        )
      );
    const deathEvents = await queryRunner.manager
      .find(DeathEventEntity, {
        relations: ["victim"],
      })
      .then((ss) =>
        ss.map(
          (s): EventV2Entity => ({
            ...s,
            excerpt: {},
            type: DeathType.value,
            payload: {
              location: s.location ?? undefined,
              victim: s.victim.id as any,
              links: [],
              media: [],
              keywords: [],
            },
          })
        )
      );

    const scientificStudies = await queryRunner.manager
      .find(ScientificStudyEntity, {
        relations: ["authors", "publisher"],
      })
      .then((ss) =>
        ss.map(
          (s): EventV2Entity => ({
            ...s,
            type: ScientificStudyType.value,
            payload: {
              title: s.title,
              url: s.url as any,
              publisher: s.publisher.id as any,
              authors: s.authors as any[],
              body: null,
              keywords: [],
            },
            excerpt: {},
            date: s.publishDate,
          })
        )
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
      `DROP INDEX "public"."IDX_a4b35dfde2e290d5978c0dc982"`
    );
    await queryRunner.query(`DROP TABLE "event_v2"`);
    await queryRunner.query(`DROP TYPE "public"."event_v2_type_enum"`);
  }
}
