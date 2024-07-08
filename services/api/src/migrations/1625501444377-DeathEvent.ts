import { type MigrationInterface, type QueryRunner } from "typeorm";

export class DeathEvent1625501444377 implements MigrationInterface {
  name = "DeathEvent1625501444377";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_7da98183ab5c393e83badea7061"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_632d06b78600e438191d861756b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_62cafbc449a2411de7c264f0624"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf"`,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL, "location" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "victimId" uuid NOT NULL, CONSTRAINT "REL_71392d871d1694d54c484e5890" UNIQUE ("victimId"), CONSTRAINT "PK_4bfe043ba1d8ca4e8bb959d883b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bfe043ba1d8ca4e8bb959d883" ON "death_event" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event_images_image" ("deathEventId" uuid NOT NULL, "imageId" uuid NOT NULL, CONSTRAINT "PK_ef7dd30bbd3651eac64806be4ab" PRIMARY KEY ("deathEventId", "imageId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9232ffd1f98cb2644a6cca0f54" ON "death_event_images_image" ("deathEventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fe5ac5d574df2198d4299ed3f" ON "death_event_images_image" ("imageId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event_subspected_groups_group" ("deathEventId" uuid NOT NULL, "groupId" uuid NOT NULL, CONSTRAINT "PK_afd2f5f9864d7ff50144cb72f9d" PRIMARY KEY ("deathEventId", "groupId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20256b5eae467c0e98c37df6d4" ON "death_event_subspected_groups_group" ("deathEventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c201682b784d301fab172eefcc" ON "death_event_subspected_groups_group" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event_supsected_actors_actor" ("deathEventId" uuid NOT NULL, "actorId" uuid NOT NULL, CONSTRAINT "PK_2faac43650216a36eef13dc2bd8" PRIMARY KEY ("deathEventId", "actorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efa7cddadd4dac83cafb72506c" ON "death_event_supsected_actors_actor" ("deathEventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2833db907ae84bd0ad2db3eed4" ON "death_event_supsected_actors_actor" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "death_event_suspected_groups_members_group_member" ("deathEventId" uuid NOT NULL, "groupMemberId" uuid NOT NULL, CONSTRAINT "PK_468dd7f5452e6b1fca46ee2422e" PRIMARY KEY ("deathEventId", "groupMemberId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_baf6fa868e3ba722c2a38a55b3" ON "death_event_suspected_groups_members_group_member" ("deathEventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f8aa12fc6eefa370699142438" ON "death_event_suspected_groups_members_group_member" ("groupMemberId") `,
    );
    await queryRunner.query(`ALTER TABLE "link" ADD "deathId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "death_event" ADD CONSTRAINT "FK_71392d871d1694d54c484e58907" FOREIGN KEY ("victimId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_09ec8d4ac1777ee0078d5933ecb" FOREIGN KEY ("deathId") REFERENCES "death_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_images_image" ADD CONSTRAINT "FK_9232ffd1f98cb2644a6cca0f548" FOREIGN KEY ("deathEventId") REFERENCES "death_event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_images_image" ADD CONSTRAINT "FK_7fe5ac5d574df2198d4299ed3f7" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" ADD CONSTRAINT "FK_20256b5eae467c0e98c37df6d43" FOREIGN KEY ("deathEventId") REFERENCES "death_event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" ADD CONSTRAINT "FK_c201682b784d301fab172eefccb" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" ADD CONSTRAINT "FK_efa7cddadd4dac83cafb72506cb" FOREIGN KEY ("deathEventId") REFERENCES "death_event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" ADD CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" ADD CONSTRAINT "FK_baf6fa868e3ba722c2a38a55b34" FOREIGN KEY ("deathEventId") REFERENCES "death_event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" ADD CONSTRAINT "FK_0f8aa12fc6eefa3706991424380" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_7da98183ab5c393e83badea7061" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_632d06b78600e438191d861756b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_62cafbc449a2411de7c264f0624" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" DROP CONSTRAINT "FK_62cafbc449a2411de7c264f0624"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" DROP CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" DROP CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_632d06b78600e438191d861756b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" DROP CONSTRAINT "FK_7da98183ab5c393e83badea7061"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" DROP CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" DROP CONSTRAINT "FK_0f8aa12fc6eefa3706991424380"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" DROP CONSTRAINT "FK_baf6fa868e3ba722c2a38a55b34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" DROP CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" DROP CONSTRAINT "FK_efa7cddadd4dac83cafb72506cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" DROP CONSTRAINT "FK_c201682b784d301fab172eefccb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" DROP CONSTRAINT "FK_20256b5eae467c0e98c37df6d43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_images_image" DROP CONSTRAINT "FK_7fe5ac5d574df2198d4299ed3f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_images_image" DROP CONSTRAINT "FK_9232ffd1f98cb2644a6cca0f548"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_09ec8d4ac1777ee0078d5933ecb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event" DROP CONSTRAINT "FK_71392d871d1694d54c484e58907"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "deathId"`);
    await queryRunner.query(`DROP INDEX "IDX_0f8aa12fc6eefa370699142438"`);
    await queryRunner.query(`DROP INDEX "IDX_baf6fa868e3ba722c2a38a55b3"`);
    await queryRunner.query(
      `DROP TABLE "death_event_suspected_groups_members_group_member"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_2833db907ae84bd0ad2db3eed4"`);
    await queryRunner.query(`DROP INDEX "IDX_efa7cddadd4dac83cafb72506c"`);
    await queryRunner.query(`DROP TABLE "death_event_supsected_actors_actor"`);
    await queryRunner.query(`DROP INDEX "IDX_c201682b784d301fab172eefcc"`);
    await queryRunner.query(`DROP INDEX "IDX_20256b5eae467c0e98c37df6d4"`);
    await queryRunner.query(`DROP TABLE "death_event_subspected_groups_group"`);
    await queryRunner.query(`DROP INDEX "IDX_7fe5ac5d574df2198d4299ed3f"`);
    await queryRunner.query(`DROP INDEX "IDX_9232ffd1f98cb2644a6cca0f54"`);
    await queryRunner.query(`DROP TABLE "death_event_images_image"`);
    await queryRunner.query(`DROP INDEX "IDX_4bfe043ba1d8ca4e8bb959d883"`);
    await queryRunner.query(`DROP TABLE "death_event"`);
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_ddbc42b34a83947249edda0f0cf" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_areas_area" ADD CONSTRAINT "FK_62cafbc449a2411de7c264f0624" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_1557dc9d63a8f762584b9a6e1e7" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_members_group_member" ADD CONSTRAINT "FK_3fa8d52ba682e1d10a9c65be47e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_5908dd3112a84f84ae3d39931b0" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_actors_actor" ADD CONSTRAINT "FK_7a60826de16e95c99ac9b790b1f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_632d06b78600e438191d861756b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_groups_group" ADD CONSTRAINT "FK_7da98183ab5c393e83badea7061" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_fb0313bb02cfd78a2eb66ca6dcd" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_images_image" ADD CONSTRAINT "FK_4bf8c74b5f4a1113b2bca952019" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
