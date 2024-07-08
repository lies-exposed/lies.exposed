import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ActorGroupRelation1631892029981 implements MigrationInterface {
  name = "ActorGroupRelation1631892029981";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."link" DROP CONSTRAINT "FK_6429a5afe364d851f91401d37d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."link" DROP CONSTRAINT "FK_09ec8d4ac1777ee0078d5933ecb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."link" DROP COLUMN "eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."link" DROP COLUMN "deathId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" DROP CONSTRAINT "FK_44c8964c097cf7f71434d6d1122"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" DROP CONSTRAINT "FK_12da61769be46b89062180539ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ALTER COLUMN "groupId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ALTER COLUMN "actorId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."page" ADD CONSTRAINT "UQ_c626d5727165ae77d148007940d" UNIQUE ("path")`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ADD CONSTRAINT "FK_44c8964c097cf7f71434d6d1122" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ADD CONSTRAINT "FK_12da61769be46b89062180539ee" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" DROP CONSTRAINT "FK_12da61769be46b89062180539ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" DROP CONSTRAINT "FK_44c8964c097cf7f71434d6d1122"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."page" DROP CONSTRAINT "UQ_c626d5727165ae77d148007940d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ALTER COLUMN "actorId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ALTER COLUMN "groupId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ADD CONSTRAINT "FK_12da61769be46b89062180539ee" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."group_member" ADD CONSTRAINT "FK_44c8964c097cf7f71434d6d1122" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "public"."link" ADD "deathId" uuid`);
    await queryRunner.query(`ALTER TABLE "public"."link" ADD "eventId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "public"."link" ADD CONSTRAINT "FK_09ec8d4ac1777ee0078d5933ecb" FOREIGN KEY ("deathId") REFERENCES "death_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."link" ADD CONSTRAINT "FK_6429a5afe364d851f91401d37d4" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
