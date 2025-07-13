import { type MigrationInterface, type QueryRunner } from "typeorm";

export class DropActorAndEventIdIndexes1752395740445
  implements MigrationInterface
{
  name = "DropActorAndEventIdIndexes1752395740445";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4b35dfde2e290d5978c0dc982"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05b325494fcc996a44ae6928e5"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_05b325494fcc996a44ae6928e5" ON "actor" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4b35dfde2e290d5978c0dc982" ON "event_v2" ("id") `,
    );
  }
}
