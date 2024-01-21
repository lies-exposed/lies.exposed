import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTelegramId1705830606877 implements MigrationInterface {
  name = "UserTelegramId1705830606877";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegramId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_6758e6c1db84e6f7e711f8021f5" UNIQUE ("telegramId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telegramToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_5d407ad75c2f523490653938ce6" UNIQUE ("telegramToken")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_5d407ad75c2f523490653938ce6"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telegramToken"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_6758e6c1db84e6f7e711f8021f5"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telegramId"`);
  }
}
