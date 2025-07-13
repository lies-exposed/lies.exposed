import { type MigrationInterface, type QueryRunner } from "typeorm";

export class NullableImageDescription1752395823143
  implements MigrationInterface
{
  name = "NullableImageDescription1752395823143";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" ALTER COLUMN "description" SET NOT NULL`,
    );
  }
}
