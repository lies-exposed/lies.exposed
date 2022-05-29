import { LinkEntity } from "@entities/Link.entity";
import { uuid } from "@liexp/shared/utils/uuid";
import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkMediaEntity1653734131242 implements MigrationInterface {
  name = "LinkMediaEntity1653734131242";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // event links
    await queryRunner.query(
      `CREATE TABLE "event_links_link" ("eventId" uuid NOT NULL, "linkId" uuid NOT NULL, CONSTRAINT "PK_e8aba63be0f41e27b1df6d654a6" PRIMARY KEY ("eventId", "linkId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_678c2a6ff3b2873f6b122c7eaa" ON "event_links_link" ("eventId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4b9fff131b55febfe8e5ee864" ON "event_links_link" ("linkId") `
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" ADD CONSTRAINT "FK_678c2a6ff3b2873f6b122c7eaac" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" ADD CONSTRAINT "FK_f4b9fff131b55febfe8e5ee8642" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    const links = await queryRunner.manager.query('SELECT * FROM "link"');

    // image links
    await queryRunner.query(
      `ALTER TABLE "link" RENAME COLUMN "image" TO "imageId"`
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "imageId"`);
    await queryRunner.query(`ALTER TABLE "link" ADD "imageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await Promise.all(
      links
      .filter((l:any) => l.image !== null)
      .map(async (l: any) => {
        console.log("link", { id: l.id, image: l.image });
        const image = l.image ? (l.image as any as string) : "";
        const media = await queryRunner.manager
          .getRepository("image")
          .save({
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
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const links = await queryRunner.manager.getRepository(LinkEntity).find({
      relations: ["image"],
    });

    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_f4b9fff131b55febfe8e5ee8642"`
    );
    await queryRunner.query(
      `ALTER TABLE "event_links_link" DROP CONSTRAINT "FK_678c2a6ff3b2873f6b122c7eaac"`
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_1add2b8ab1cd5bf6f62f0ef8627"`
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "imageId"`);
    await queryRunner.query(
      `ALTER TABLE "link" ADD "imageId" character varying`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4b9fff131b55febfe8e5ee864"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_678c2a6ff3b2873f6b122c7eaa"`
    );
    await queryRunner.query(`DROP TABLE "event_links_link"`);
    await queryRunner.query(
      `ALTER TABLE "link" RENAME COLUMN "imageId" TO "image"`
    );

    await Promise.all([
      links.map(async (l) => {
        await queryRunner.manager.query(`UPDATE "link" SET "image" = $1 WHERE "id" IN ($2)`, [l.image?.location, l.id]);
      }),
    ]);
  }
}
