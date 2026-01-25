import { type MigrationInterface, type QueryRunner } from "typeorm";

export class Queue1769364052946 implements MigrationInterface {
  name = "Queue1769364052946";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."queue_type_enum" AS ENUM('openai-embedding', 'openai-summarize', 'openai-create-event-from-url', 'openai-create-event-from-text', 'openai-create-event-from-links', 'openai-update-event')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."queue_resource_enum" AS ENUM('index', 'events', 'keywords', 'actors', 'groups', 'stories', 'areas', 'projects', 'media', 'profile', 'links', 'events/suggestions')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."queue_status_enum" AS ENUM('pending', 'processing', 'done', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "queue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "public"."queue_type_enum" NOT NULL DEFAULT 'openai-embedding', "resource" "public"."queue_resource_enum" NOT NULL DEFAULT 'index', "status" "public"."queue_status_enum" NOT NULL DEFAULT 'pending', "prompt" character varying, "data" jsonb NOT NULL, "result" jsonb, "error" jsonb, CONSTRAINT "PK_4adefbd9c73b3f9a49985a5529f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "queue"`);
    await queryRunner.query(`DROP TYPE "public"."queue_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."queue_resource_enum"`);
    await queryRunner.query(`DROP TYPE "public"."queue_type_enum"`);
  }
}
