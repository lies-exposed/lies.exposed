import { type MigrationInterface, type QueryRunner } from "typeorm";

export class SocialPost1688404565649 implements MigrationInterface {
  name = "SocialPost1688404565649";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_post_status_enum" AS ENUM('TO_PUBLISH', 'PUBLISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "social_post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity" uuid NOT NULL, "type" varchar NOT NULL, "content" json NOT NULL, "status" "public"."social_post_status_enum" NOT NULL, "result" json, "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_33f77d83d5d8e1db11c99c5c3f3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "social_post"`);
    await queryRunner.query(`DROP TYPE "public"."social_post_status_enum"`);
  }
}
