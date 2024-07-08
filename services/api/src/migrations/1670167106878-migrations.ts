import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1670167083399 implements MigrationInterface {
  name = "migrations1670167083399";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_59c5368401a882919267f8616ce"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "image" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_59c5368401a882919267f8616ce" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_59c5368401a882919267f8616ce"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "image" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_59c5368401a882919267f8616ce" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
