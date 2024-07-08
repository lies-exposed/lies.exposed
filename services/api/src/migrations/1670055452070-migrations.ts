import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1670055452070 implements MigrationInterface {
  name = "migrations1670055452070";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" DROP CONSTRAINT "FK_a17d14e3f937bdd280f962afdb5"`,
    );

    await queryRunner.query(
      `ALTER TABLE "event_suggestion" RENAME COLUMN "createdById" TO "creatorId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "event_suggestion" ADD CONSTRAINT "FK_7012331206cd3420037fccc9774" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" DROP CONSTRAINT "FK_7012331206cd3420037fccc9774"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" RENAME COLUMN "creatorId" TO "createdById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" ADD CONSTRAINT "FK_a17d14e3f937bdd280f962afdb5" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
