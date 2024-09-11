import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AvatarFieldToMediaEntity1726080928930
  implements MigrationInterface
{
  name = "AvatarFieldToMediaEntity1726080928930";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" RENAME "avatar" TO "old_avatar"`,
    );
    await queryRunner.query(`ALTER TABLE "group" ADD "avatarId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "UQ_33aa601f5bc0babe186c75421a1" UNIQUE ("avatarId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "actor" RENAME "avatar" TO "old_avatar"`,
    );

    await queryRunner.query(`ALTER TABLE "actor" ADD "avatarId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_33aa601f5bc0babe186c75421a1" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "actor" ADD CONSTRAINT "FK_64b2e574248b519659baa812e2f" FOREIGN KEY ("avatarId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_33aa601f5bc0babe186c75421a1"`,
    );

    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "FK_64b2e574248b519659baa812e2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_33aa601f5bc0babe186c75421a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor" DROP CONSTRAINT "UQ_64b2e574248b519659baa812e2f"`,
    );
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "avatarId"`);
    await queryRunner.query(
      `ALTER TABLE "actor" RENAME "old_avatar" TO "avatar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "UQ_33aa601f5bc0babe186c75421a1"`,
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "avatarId"`);
    await queryRunner.query(
      `ALTER TABLE "group" RENAME "old_avatar" TO "avatar"`,
    );
  }
}
