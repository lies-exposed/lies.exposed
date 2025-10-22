import { type MigrationInterface, type QueryRunner } from "typeorm";

export class RemoveActorAndGroupOldAvatar1761150918382
  implements MigrationInterface
{
  name = "RemoveActorAndGroupOldAvatar1761150918382";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_59db3731bb1da73f87200450623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" DROP CONSTRAINT "FK_879c17097616a893de46c8b64a6"`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "old_avatar"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "old_avatar"`);
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_59db3731bb1da73f87200450623" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" ADD CONSTRAINT "FK_879c17097616a893de46c8b64a6" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" DROP CONSTRAINT "FK_879c17097616a893de46c8b64a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_59db3731bb1da73f87200450623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" ADD "old_avatar" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD "old_avatar" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_stories_story" ADD CONSTRAINT "FK_879c17097616a893de46c8b64a6" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_59db3731bb1da73f87200450623" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
