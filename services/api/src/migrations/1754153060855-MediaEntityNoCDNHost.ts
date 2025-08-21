import { type MigrationInterface, type QueryRunner } from "typeorm";

export class MediaEntityNoCDNHost1754153060855 implements MigrationInterface {
  name = "MediaEntityNoCDNHost1754153060855";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", 'https://econnessione-alpha.fra1.digitaloceanspaces.com', 'https://space.lies.exposed') where i.\"location\" like 'https://econnessione-alpha.fra1.digitaloceanspaces.com%'",
    );
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", 'https://fra1.digitaloceanspaces.com/econnessione-alpha', 'https://space.lies.exposed') where i.\"location\" like 'https://fra1.digitaloceanspaces.com/econnessione-alpha/%'",
    );
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", 'fra1.digitaloceanspaces.com/econnessione-alpha', 'https://space.lies.exposed') where i.\"location\" like 'fra1.digitaloceanspaces.com/econnessione-alpha/%'",
    );

    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", 'https://econnessione-alpha.fra1.digitaloceanspaces.com', 'https://space.lies.exposed') where i.\"thumbnail\" like 'https://econnessione-alpha.fra1.digitaloceanspaces.com%'",
    );
    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", 'https://fra1.digitaloceanspaces.com/econnessione-alpha', 'https://space.lies.exposed') where i.\"thumbnail\" like 'https://fra1.digitaloceanspaces.com/econnessione-alpha/%'",
    );
    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", 'fra1.digitaloceanspaces.com/econnessione-alpha', 'https://space.lies.exposed') where i.\"thumbnail\" like 'fra1.digitaloceanspaces.com/econnessione-alpha/%'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "update image i set \"location\" = replace(\"location\", 'https://space.lies.exposed', 'https://econnessione-alpha.fra1.digitaloceanspaces.com') where i.\"location\" like 'https://space.lies.exposed%'",
    );
    await queryRunner.query(
      "update image i set \"thumbnail\" = replace(\"thumbnail\", 'https://space.lies.exposed', 'https://econnessione-alpha.fra1.digitaloceanspaces.com') where i.\"thumbnail\" like 'https://space.lies.exposed%'",
    );
  }
}
