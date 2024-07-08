import { type MigrationInterface, type QueryRunner } from "typeorm";

export class BodyAsJSON1637327859598 implements MigrationInterface {
  name = "BodyAsJSON1637327859598";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scientific_study" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "scientific_study" ADD "body2" json`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "group" ADD "body2" json`);
    await queryRunner.query(
      `ALTER TABLE "event" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "event" ADD "body2" json`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "group_member" ADD "body2" json`);
    await queryRunner.query(
      `ALTER TABLE "actor" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "actor" ADD "body2" json`);
    await queryRunner.query(
      `ALTER TABLE "article" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "article" ADD "body2" json`);
    await queryRunner.query(`ALTER TABLE "page" ADD "body2" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "scientific_study" DROP COLUMN "body2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study" DROP COLUMN "excerpt"`,
    );
  }
}
