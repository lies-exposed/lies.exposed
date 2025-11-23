import { type MigrationInterface, type QueryRunner } from "typeorm";

export class UnaccentExtension1763895614385 implements MigrationInterface {
  name = "UnaccentExtension1763895614385";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent`);
  }
}
