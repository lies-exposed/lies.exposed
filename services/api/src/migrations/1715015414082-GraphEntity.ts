import { type MigrationInterface, type QueryRunner } from "typeorm";

export class GraphEntity1715015414082 implements MigrationInterface {
  name = "GraphEntity1715015414082";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "graph" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "slug" character varying NOT NULL DEFAULT 'uuid_generate_v4()', "draft" boolean NOT NULL DEFAULT true, "graphType" text NOT NULL DEFAULT false, "data" json NOT NULL, "options" json NOT NULL, "excerpt" json, "body" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "creatorId" uuid, CONSTRAINT "UQ_8913cf46e8876cb88e83e2de3bf" UNIQUE ("slug"), CONSTRAINT "PK_eb3e36eefae596e0ba9122fff16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8913cf46e8876cb88e83e2de3b" ON "graph" ("slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "graph" ADD CONSTRAINT "FK_c184562f56bd9e15ebb247d3bed" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE "graph" DROP CONSTRAINT "FK_c184562f56bd9e15ebb247d3bed"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8913cf46e8876cb88e83e2de3b"`,
    );
    await queryRunner.query(`DROP TABLE "graph"`);
  }
}
