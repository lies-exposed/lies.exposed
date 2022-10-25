import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1666718980362 implements MigrationInterface {
    name = 'migrations1666718980362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" ADD "creatorId" uuid`);
        await queryRunner.query(`ALTER TABLE "link" ADD CONSTRAINT "FK_9f7e4faa3c0bb12b46a1a66ddcb" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" DROP CONSTRAINT "FK_9f7e4faa3c0bb12b46a1a66ddcb"`);
        await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "creatorId"`);
    }

}

