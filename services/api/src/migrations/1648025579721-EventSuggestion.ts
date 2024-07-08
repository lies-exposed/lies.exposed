import { type MigrationInterface, type QueryRunner } from "typeorm";

export class EventSuggestion1648025579721 implements MigrationInterface {
  name = "EventSuggestion1648025579721";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_suggestion_status_enum" AS ENUM('PENDING', 'COMPLETED', 'DISCARDED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "event_suggestion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."event_suggestion_status_enum" NOT NULL, "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_eafd9893115abc7af52ba52ac9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eafd9893115abc7af52ba52ac9" ON "event_suggestion" ("id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eafd9893115abc7af52ba52ac9"`,
    );
    await queryRunner.query(`DROP TABLE "event_suggestion"`);
    await queryRunner.query(
      `DROP TYPE "public"."event_suggestion_status_enum"`,
    );
  }
}
