import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

const textToSlateValue = (text: string): any => {
  return {
    id: "701qur",
    version: 1,
    rows: [
      {
        id: "5x33f3",
        cells: [
          {
            id: "aqg2rh",
            size: 12,
            plugin: { id: "eco-slate-plugin", version: 1 },
            dataI18n: {
              en: {
                slate: [
                  {
                    type: "PARAGRAPH/PARAGRAPH",
                    children: [{ text }],
                  },
                ],
              },
            },
            rows: [],
            inline: null,
          },
        ],
      },
    ],
  };
};

const slateValueToText = (body: any): string => {
  return body.rows[0].cells[0].dataI18n.en.slate[0].children[0].text;
};

export class PayloadAndBody1640945993390 implements MigrationInterface {
  name = "PayloadAndBody1640945993390";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const actors = await queryRunner.manager.find(ActorEntity).then((ee) =>
      ee.map(
        (e): ActorEntity => ({
          ...e,
          excerpt: {},
          body: textToSlateValue(e.body as any),
        })
      )
    );

    const groups = await queryRunner.manager.find(GroupEntity).then((ee) =>
      ee.map(
        (e): GroupEntity => ({
          ...e,
          excerpt: {},
          body: textToSlateValue(e.body as any),
        })
      )
    );

    const groupsMembers = await queryRunner.manager
      .find(GroupMemberEntity)
      .then((ee) =>
        ee.map(
          (e): GroupMemberEntity => ({
            ...e,
            excerpt: {},
            body: textToSlateValue(e.body as any),
          })
        )
      );

    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body2"`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body2"`);
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body" json`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "body" json`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "excerpt"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "excerpt" json`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "body" json`);
    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" SET DEFAULT true`
    );

    // insert
    await queryRunner.manager.save(ActorEntity, actors);
    await queryRunner.manager.save(GroupEntity, groups);
    await queryRunner.manager.save(GroupMemberEntity, groupsMembers);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const actors = await queryRunner.manager.find(ActorEntity).then((ee) =>
      ee.map(
        (e): ActorEntity => ({
          ...e,
          body: (slateValueToText(e.body) as any) ?? "",
        })
      )
    );

    const groups = await queryRunner.manager.find(GroupEntity).then((ee) =>
      ee.map(
        (e): GroupEntity => ({
          ...e,
          body: (slateValueToText(e.body) as any) ?? "",
        })
      )
    );

    const groupsMembers = await queryRunner.manager
      .find(GroupMemberEntity)
      .then((ee) =>
        ee.map(
          (e): GroupMemberEntity => ({
            ...e,
            body: (slateValueToText(e.body) as any) ?? "",
          })
        )
      );

    await queryRunner.manager.save(ActorEntity, actors);
    await queryRunner.manager.save(GroupEntity, groups);
    await queryRunner.manager.save(GroupMemberEntity, groupsMembers);

    await queryRunner.query(
      `ALTER TABLE "event_v2" ALTER COLUMN "draft" DROP DEFAULT`
    );

    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "actor" ADD "body" character varying`);
    await queryRunner.query(`ALTER TABLE "actor" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "actor" ADD "excerpt" character varying`
    );
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "body" character varying`
    );
    await queryRunner.query(`ALTER TABLE "group_member" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD "excerpt" character varying`
    );
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body" character varying`);
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "excerpt"`);
    await queryRunner.query(
      `ALTER TABLE "group" ADD "excerpt" character varying`
    );

    await queryRunner.query(`ALTER TABLE "actor" ADD "body2" json`);
    await queryRunner.query(`ALTER TABLE "group_member" ADD "body2" json`);
    await queryRunner.query(`ALTER TABLE "group" ADD "body2" json`);
  }
}
