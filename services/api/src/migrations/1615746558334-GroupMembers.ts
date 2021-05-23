import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupMembers1615746558334 implements MigrationInterface {
  name = "GroupMembers1615746558334";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN IF EXISTS "color"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" ADD "color" character varying NOT NULL`
    );
  }
}
