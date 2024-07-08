import { type MigrationInterface, type QueryRunner } from "typeorm";

export class PayloadAndBody1640945993390 implements MigrationInterface {
  name = "PayloadAndBody1640945993390";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body2"`);
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body" json`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "body" json`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "body" json`);
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" DROP DEFAULT`,
    );

    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "body" character varying`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "actor" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "body" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "excerpt" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body" character varying`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD "excerpt" character varying`,
    );

    await queryRunner.query(`ALTER TABLE "actor" ADD "body2" json`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "body2" json`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body2" json`);
  }
}
