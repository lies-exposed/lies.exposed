import { type MigrationInterface, type QueryRunner } from "typeorm";

export class SocialPostEntityIndex1693475687597 implements MigrationInterface {
  name = "SocialPostEntityIndex1693475687597";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_a67d3f969a9c0865758360f22c" ON "social_post" ("type", "entity") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a67d3f969a9c0865758360f22c"`,
    );
  }
}
