import { type MigrationInterface, type QueryRunner } from "typeorm";

export class GroupNullableUsername1683196728496 implements MigrationInterface {
  name = "GroupNullableUsername1683196728496";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" ADD "username" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05b325494fcc996a44ae6928e5" ON "actor" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d4360c44758972f66e87becf6b" ON "actor" ("username") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d4360c44758972f66e87becf6b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05b325494fcc996a44ae6928e5"`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "username"`);
  }
}
