import { type MigrationInterface, type QueryRunner } from "typeorm";

export class CreateActorRelation1770551276114 implements MigrationInterface {
  name = "CreateActorRelation1770551276114";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."actor_relation_type_enum" AS ENUM('PARENT_CHILD', 'SPOUSE', 'PARTNER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "actor_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "public"."actor_relation_type_enum" NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "excerpt" json, "actorId" uuid NOT NULL, "relatedActorId" uuid NOT NULL, CONSTRAINT "UQ_actor_relation_actor_type_relatedActor" UNIQUE ("actorId", "type", "relatedActorId"), CONSTRAINT "PK_dc6dcb886cd8b662281cf8ed1d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_relation" ADD CONSTRAINT "FK_aaba32270491c9d250d07be595e" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_relation" ADD CONSTRAINT "FK_5bcb7ca786163b69cc794e7cbd0" FOREIGN KEY ("relatedActorId") REFERENCES "actor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actor_relation" DROP CONSTRAINT "FK_5bcb7ca786163b69cc794e7cbd0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_relation" DROP CONSTRAINT "FK_aaba32270491c9d250d07be595e"`,
    );
    await queryRunner.query(`DROP TABLE "actor_relation"`);
    await queryRunner.query(`DROP TYPE "public"."actor_relation_type_enum"`);
  }
}
