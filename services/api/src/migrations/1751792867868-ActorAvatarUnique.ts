import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ActorAvatarUnique1751792867868 implements MigrationInterface {
  name = "ActorAvatarUnique1751792867868";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "FK_64b2e574248b519659baa812e2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" ADD CONSTRAINT "UQ_64b2e574248b519659baa812e2f" UNIQUE ("avatarId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" ADD CONSTRAINT "FK_64b2e574248b519659baa812e2f" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "FK_64b2e574248b519659baa812e2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "UQ_64b2e574248b519659baa812e2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" ADD CONSTRAINT "FK_64b2e574248b519659baa812e2f" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
