import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ChatConversation1779000000000 implements MigrationInterface {
  name = "ChatConversation1779000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chat_conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, "title" character varying NOT NULL DEFAULT '', "agentType" character varying, "messages" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_chat_conversation_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_conversation_userId" ON "chat_conversation" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_chat_conversation_userId"`);
    await queryRunner.query(`DROP TABLE "chat_conversation"`);
  }
}
