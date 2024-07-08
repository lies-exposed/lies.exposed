import { type MigrationInterface, type QueryRunner } from "typeorm";

export class EditLinkEntity1633540575641 implements MigrationInterface {
  name = "EditLinkEntity1633540575641";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "link" ADD "title" character varying`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD "keywords" text NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD "provider" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c626d5727165ae77d148007940" ON "page" ("path") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c626d5727165ae77d148007940"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "provider"`);
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "keywords"`);
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "title"`);
  }
}
