import { type MigrationInterface, type QueryRunner } from "typeorm";

export class EventSuggestionCreatedBy1665777565401
  implements MigrationInterface
{
  name = "EventSuggestionCreatedBy1665777565401";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" ADD "createdById" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" ADD CONSTRAINT "FK_a17d14e3f937bdd280f962afdb5" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" DROP CONSTRAINT "FK_a17d14e3f937bdd280f962afdb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_suggestion" DROP COLUMN "createdById"`,
    );
  }
}
