import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1682161121802 implements MigrationInterface {
    name = 'Migrations1682161121802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group" ADD "bodyV2" json`);
        await queryRunner.query(`ALTER TABLE "actor" ADD "bodyV2" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "bodyV2"`);
        await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "bodyV2"`);
    }

}
