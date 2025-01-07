import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type MigrationInterface, type QueryRunner } from "typeorm";

export class LinkMediaEntity1653734131242 implements MigrationInterface {
  name = "LinkMediaEntity1653734131242";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const links = await queryRunner.manager.query('SELECT * FROM "link"');

    // image links
    await queryRunner.query(
      `ALTER TABLE "link" RENAME COLUMN "image" TO "imageId"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "imageId"`);
    await queryRunner.query(`ALTER TABLE "link" ADD "imageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await Promise.all(
      links
        .filter((l: any) => l.image !== null)
        .map(async (l: any) => {
          const image = l.image ? (l.image as string) : "";
          const media = await queryRunner.manager.getRepository("image").save({
            id: uuid(),
            type: "image/jpeg",
            description: l.description ?? "",
            location: image,
            thumbnail: image,
            events: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          });

          await queryRunner.manager.save(LinkEntity, [
            { ...l, image: media as any },
          ]);
        }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const links = await queryRunner.manager.getRepository(LinkEntity).find({
      relations: ["image"],
    });

    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_f4b9fff131b55febfe8e5ee8642"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_678c2a6ff3b2873f6b122c7eaac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627"`,
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "imageId"`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD "imageId" character varying`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4b9fff131b55febfe8e5ee864"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_678c2a6ff3b2873f6b122c7eaa"`,
    );
    await queryRunner.query(`DROP TABLE "event_links_link"`);
    await queryRunner.query(
      `ALTER TABLE "link" RENAME COLUMN "imageId" TO "image"`,
    );

    await Promise.all([
      links.map(async (l) => {
        await queryRunner.manager.query(
          `UPDATE "link" SET "image" = $1 WHERE "id" IN ($2)`,
          [l.image?.location, l.id],
        );
      }),
    ]);
  }
}
