import { type MigrationInterface, type QueryRunner } from "typeorm";

export class UserPermissions1665240343069 implements MigrationInterface {
  name = "UserPermissions1665240343069";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "permissions" json NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "permissions"`);
  }
}
