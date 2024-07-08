import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ArticleDate1627639542640 implements MigrationInterface {
  name = "ArticleDate1627639542640";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" DROP CONSTRAINT "FK_c201682b784d301fab172eefccb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" DROP CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" DROP CONSTRAINT "FK_0f8aa12fc6eefa3706991424380"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" ADD CONSTRAINT "FK_c201682b784d301fab172eefccb" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" ADD CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" ADD CONSTRAINT "FK_0f8aa12fc6eefa3706991424380" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" DROP CONSTRAINT "FK_0f8aa12fc6eefa3706991424380"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" DROP CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" DROP CONSTRAINT "FK_c201682b784d301fab172eefccb"`,
    );
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "date"`);
    await queryRunner.query(
      `ALTER TABLE "death_event_suspected_groups_members_group_member" ADD CONSTRAINT "FK_0f8aa12fc6eefa3706991424380" FOREIGN KEY ("groupMemberId") REFERENCES "group_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_supsected_actors_actor" ADD CONSTRAINT "FK_2833db907ae84bd0ad2db3eed40" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event_subspected_groups_group" ADD CONSTRAINT "FK_c201682b784d301fab172eefccb" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
