import { type MigrationInterface, type QueryRunner } from "typeorm";

export class ScientificStudy1633713717970 implements MigrationInterface {
  name = "ScientificStudy1633713717970";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scientific_study" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "publishDate" TIMESTAMP WITH TIME ZONE NOT NULL, "abstract" character varying, "results" character varying, "conclusion" character varying NOT NULL, "url" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "publisherId" uuid, CONSTRAINT "PK_20e229ed7f4624a23cc237f6965" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20e229ed7f4624a23cc237f696" ON "scientific_study" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "scientific_study_authors_actor" ("scientificStudyId" uuid NOT NULL, "actorId" uuid NOT NULL, CONSTRAINT "PK_f0ab1276315782cb0d7a615ff3e" PRIMARY KEY ("scientificStudyId", "actorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e420cb9ca8a3b612b616177a6" ON "scientific_study_authors_actor" ("scientificStudyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07e9ac49367c6ad6e9f10e1eb6" ON "scientific_study_authors_actor" ("actorId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study" ADD CONSTRAINT "FK_e0212f67222c031fba6a6c23d67" FOREIGN KEY ("publisherId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study_authors_actor" ADD CONSTRAINT "FK_3e420cb9ca8a3b612b616177a6c" FOREIGN KEY ("scientificStudyId") REFERENCES "scientific_study"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study_authors_actor" ADD CONSTRAINT "FK_07e9ac49367c6ad6e9f10e1eb6c" FOREIGN KEY ("actorId") REFERENCES "actor"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scientific_study_authors_actor" DROP CONSTRAINT "FK_07e9ac49367c6ad6e9f10e1eb6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study_authors_actor" DROP CONSTRAINT "FK_3e420cb9ca8a3b612b616177a6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scientific_study" DROP CONSTRAINT "FK_e0212f67222c031fba6a6c23d67"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_07e9ac49367c6ad6e9f10e1eb6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e420cb9ca8a3b612b616177a6"`,
    );
    await queryRunner.query(`DROP TABLE "scientific_study_authors_actor"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20e229ed7f4624a23cc237f696"`,
    );
    await queryRunner.query(`DROP TABLE "scientific_study"`);
  }
}
