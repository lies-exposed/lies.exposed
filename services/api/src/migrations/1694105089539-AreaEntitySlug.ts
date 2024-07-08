import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AreaEntitySlug1694105089539 implements MigrationInterface {
  name = "AreaEntitySlug1694105089539";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "area" ADD "slug" character varying NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD "draft" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" ADD CONSTRAINT "UQ_ad49263b9c3858bd269aa7bbf72" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad49263b9c3858bd269aa7bbf7" ON "area" ("slug") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad49263b9c3858bd269aa7bbf7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "area" DROP CONSTRAINT "UQ_ad49263b9c3858bd269aa7bbf72"`,
    );
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "draft"`);
    await queryRunner.query(`ALTER TABLE "area" DROP COLUMN "slug"`);
  }
}
