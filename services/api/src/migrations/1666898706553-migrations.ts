import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1666898706553 implements MigrationInterface {
  name = "migrations1666898706553";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image" ADD "creatorId" uuid`);
    await queryRunner.query(`ALTER TABLE "link" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_59c5368401a882919267f8616ce" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_9f7e4faa3c0bb12b46a1a66ddcb" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_9f7e4faa3c0bb12b46a1a66ddcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_59c5368401a882919267f8616ce"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "creatorId"`);
  }
}
