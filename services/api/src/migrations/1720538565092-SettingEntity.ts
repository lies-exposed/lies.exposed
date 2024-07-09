import { type MigrationInterface, type QueryRunner } from "typeorm";

export class SettingEntity1720538565092 implements MigrationInterface {
  name = "SettingEntity1720538565092";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "settings" ("id" character varying(255) NOT NULL, "value" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_0669fe20e252eb692bf4d34497" ON "settings" ("id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_0669fe20e252eb692bf4d34497"`);
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
