import { type MigrationInterface, type QueryRunner } from "typeorm";

export class StoryUniquePath1684592879685 implements MigrationInterface {
  name = "StoryUniquePath1684592879685";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "UQ_fafac59e0528640d30e398b1c0e" UNIQUE ("path")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "UQ_fafac59e0528640d30e398b1c0e"`,
    );
  }
}
