import { type MigrationInterface, type QueryRunner } from "typeorm";

export class MediaEntityNoCDNHost1754153060855 implements MigrationInterface {
  name = "MediaEntityNoCDNHost1754153060855";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", 'https://econnessione-alpha.fra1.digitaloceanspaces.com', '') where i.\"location\" like 'https://econnessione-alpha.fra1.digitaloceanspaces.com%'",
    );

    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", 'https://econnessione-alpha.fra1.digitaloceanspaces.com', '') where i.\"thumbnail\" like 'https://econnessione-alpha.fra1.digitaloceanspaces.com%'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", '/', 'https://econnessione-alpha.fra1.digitaloceanspaces.com/') where i.\"location\" like '/%'",
    );

    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", '/', 'https://econnessione-alpha.fra1.digitaloceanspaces.com/') where i.\"thumbnail\" like '/%'",
    );
  }
}
