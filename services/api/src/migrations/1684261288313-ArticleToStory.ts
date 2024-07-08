import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ArticleToStory1684261288313 implements MigrationInterface {
  name = "ArticleToStory1684261288313";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "story" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "draft" boolean NOT NULL DEFAULT true, "path" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE, "excerpt" character varying, "body" character varying NOT NULL, "body2" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "featuredImageId" uuid, "creatorId" uuid, CONSTRAINT "PK_28fce6873d61e2cace70a0f3361" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "keyword_stories_story" ("keywordId" uuid NOT NULL, "storyId" uuid NOT NULL, CONSTRAINT "PK_d27002a3b6e67253cf779c787d2" PRIMARY KEY ("keywordId", "storyId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d27db9b59d1b24a94564aa8d2a" ON "keyword_stories_story" ("keywordId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_879c17097616a893de46c8b64a" ON "keyword_stories_story" ("storyId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_191e2930c30d581c1f01fac5017" FOREIGN KEY ("featuredImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_59db3731bb1da73f87200450623" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" ADD CONSTRAINT "FK_d27db9b59d1b24a94564aa8d2ab" FOREIGN KEY ("keywordId") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" ADD CONSTRAINT "FK_879c17097616a893de46c8b64a6" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE TABLE "group_stories_story" ("groupId" uuid NOT NULL, "storyId" uuid NOT NULL, CONSTRAINT "PK_6681988b59171a2ea4f40297
        741" PRIMARY KEY ("groupId", "storyId"))`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c1eac1bd589e205da8633abeb8" ON "group_stories_story" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6da1ff2182702e6c496d699c89" ON "group_stories_story" ("storyId") `,
    );
    await queryRunner.query(`CREATE TABLE "story_events_event_v2" ("storyId" uuid NOT NULL, "eventV2Id" uuid NOT NULL, CONSTRAINT "PK_55af0dbb6a964621b364
        af43fd6" PRIMARY KEY ("storyId", "eventV2Id"))`);
    await queryRunner.query(
      `CREATE INDEX "IDX_df5d29e531027ea361f5b05607" ON "story_events_event_v2" ("storyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4d7604cc22cebdecc36241a73" ON "story_events_event_v2" ("eventV2Id") `,
    );
    await queryRunner.query(`CREATE TABLE "actor_stories_story" ("actorId" uuid NOT NULL, "storyId" uuid NOT NULL, CONSTRAINT "PK_237a9a144e4b0529cfdd18b0
        fc3" PRIMARY KEY ("actorId", "storyId"))`);
    await queryRunner.query(
      `CREATE INDEX "IDX_e2b43b3b1ac42f21929b475c09" ON "actor_stories_story" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6f2db5bf747fec39d5ec833f8" ON "actor_stories_story" ("storyId") `,
    );
    await queryRunner.query(`ALTER TABLE "group_stories_story" ADD CONSTRAINT "FK_c1eac1bd589e205da8633abeb8c" FOREIGN KEY ("groupId") REFERENCES "group"(
        "id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "group_stories_story" ADD CONSTRAINT "FK_6da1ff2182702e6c496d699c89f" FOREIGN KEY ("storyId") REFERENCES "story"(
        "id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" ADD CONSTRAINT "FK_df5d29e531027ea361f5b05607d" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" ADD CONSTRAINT "FK_a4d7604cc22cebdecc36241a73d" FOREIGN KEY ("eventV2Id") REFERENCES "event_v2"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_stories_story" ADD CONSTRAINT "FK_e2b43b3b1ac42f21929b475c096" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_stories_story" ADD CONSTRAINT "FK_e6f2db5bf747fec39d5ec833f88" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "story_media_image" ("storyId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_eb85467de8362b6aec6de8fd8e3" PRIMARY KEY ("storyId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a15ddd84a5b656d4b2280639e0" ON "story_media_image" ("storyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac71c01132c6659a886926213b" ON "story_media_image" ("imageId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "story_media_image" ADD CONSTRAINT "FK_a15ddd84a5b656d4b2280639e0e" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_media_image" ADD CONSTRAINT "FK_ac71c01132c6659a886926213b7" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story_media_image" DROP CONSTRAINT "FK_ac71c01132c6659a886926213b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_media_image" DROP CONSTRAINT "FK_a15ddd84a5b656d4b2280639e0e"`,
    );

    await queryRunner.query(
      `ALTER TABLE "actor_stories_story" DROP CONSTRAINT "FK_e6f2db5bf747fec39d5ec833f88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_stories_story" DROP CONSTRAINT "FK_e2b43b3b1ac42f21929b475c096"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" DROP CONSTRAINT "FK_a4d7604cc22cebdecc36241a73d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_events_event_v2" DROP CONSTRAINT "FK_df5d29e531027ea361f5b05607d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_stories_story" DROP CONSTRAINT "FK_6da1ff2182702e6c496d699c89f"`,
    );

    await queryRunner.query(
      `ALTER TABLE "group_stories_story" DROP CONSTRAINT "FK_c1eac1bd589e205da8633abeb8c"`,
    );

    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" DROP CONSTRAINT "FK_879c17097616a893de46c8b64a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" DROP CONSTRAINT "FK_d27db9b59d1b24a94564aa8d2ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_59db3731bb1da73f87200450623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_191e2930c30d581c1f01fac5017"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4d7604cc22cebdecc36241a73"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df5d29e531027ea361f5b05607"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6da1ff2182702e6c496d699c89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1eac1bd589e205da8633abeb8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac71c01132c6659a886926213b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a15ddd84a5b656d4b2280639e0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6f2db5bf747fec39d5ec833f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2b43b3b1ac42f21929b475c09"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_879c17097616a893de46c8b64a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d27db9b59d1b24a94564aa8d2a"`,
    );

    await queryRunner.query(`DROP TABLE "story_media_image"`);

    await queryRunner.query(`DROP TABLE "actor_stories_story"`);

    await queryRunner.query(`DROP TABLE "story_events_event_v2"`);

    await queryRunner.query(`DROP TABLE "group_stories_story"`);
    await queryRunner.query(`DROP TABLE "keyword_stories_story"`);
    await queryRunner.query(`DROP TABLE "story"`);
  }
}
