import { type MigrationInterface, type QueryRunner } from "typeorm";

export class NationEntity1752402648382 implements MigrationInterface {
  name = "NationEntity1752402648382";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "isoCode" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_67f8de081958446ecffec5bef89" UNIQUE ("isoCode"), CONSTRAINT "PK_923ae06a2be81addedb0aff5f02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "actor_nationalities_nation" ("actorId" uuid NOT NULL, "nationId" uuid NOT NULL, CONSTRAINT "PK_11d270649f596db581a7e0afa55" PRIMARY KEY ("actorId", "nationId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f1718f6344e95b196c2882da4" ON "actor_nationalities_nation" ("actorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_24bd31e2c39e2d9abd48541ee4" ON "actor_nationalities_nation" ("nationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_nationalities_nation" ADD CONSTRAINT "FK_4f1718f6344e95b196c2882da44" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_nationalities_nation" ADD CONSTRAINT "FK_24bd31e2c39e2d9abd48541ee4c" FOREIGN KEY ("nationId") REFERENCES "nation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actor_nationalities_nation" DROP CONSTRAINT "FK_24bd31e2c39e2d9abd48541ee4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actor_nationalities_nation" DROP CONSTRAINT "FK_4f1718f6344e95b196c2882da44"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24bd31e2c39e2d9abd48541ee4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f1718f6344e95b196c2882da4"`,
    );
    await queryRunner.query(`DROP TABLE "actor_nationalities_nation"`);
    await queryRunner.query(`DROP TABLE "nation"`);
  }
}
