import { type MigrationInterface, type QueryRunner } from "typeorm";

export class migrations1670324048132 implements MigrationInterface {
  name = "migrations1670324048132";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "article" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_73bd593f880a989870fa0b70ee3" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_59c5368401a882919267f8616ce"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "image" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_04a298d4b0c32a2ad4cb3f736fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "UQ_04a298d4b0c32a2ad4cb3f736fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_04a298d4b0c32a2ad4cb3f736fe" FOREIGN KEY ("featuredImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_59c5368401a882919267f8616ce" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_59c5368401a882919267f8616ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_04a298d4b0c32a2ad4cb3f736fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "UQ_04a298d4b0c32a2ad4cb3f736fe" UNIQUE ("featuredImageId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_04a298d4b0c32a2ad4cb3f736fe" FOREIGN KEY ("featuredImageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "image" ADD "creatorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_59c5368401a882919267f8616ce" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_73bd593f880a989870fa0b70ee3"`,
    );
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "creatorId"`);
  }
}
