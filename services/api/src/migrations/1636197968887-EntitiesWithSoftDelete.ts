import { type MigrationInterface, type QueryRunner } from "typeorm";

export class EntitiesWithSoftDelete1636197968887 implements MigrationInterface {
  name = "EntitiesWithSoftDelete1636197968887";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "link" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "keyword" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "scientific_study" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "group" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "event" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "death_event" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "actor" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "area" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "article" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "page" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "project_image" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "project" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "project_image" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "death_event" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "scientific_study" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "keyword" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "deletedAt"`);
  }
}
