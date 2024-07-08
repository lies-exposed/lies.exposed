import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ActorDates1687627273037 implements MigrationInterface {
  name = "ActorDates1687627273037";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "actor" ADD "bornOn" date`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "diedOn" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "diedOn"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "bornOn"`);
  }
}
