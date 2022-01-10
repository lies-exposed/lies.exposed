import { UncategorizedV2Payload } from "@econnessione/shared/io/http/Events/Uncategorized";
import { ViewColumn, ViewEntity } from "typeorm";
import { LinkEntity } from "../Link.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";

@ViewEntity({
  expression: `
      SELECT
        "event"."id" AS "id",
        "event"."payload" AS "payload",
        "event"."date" as "date",
        "actor" as "actors",
        "group" as "groups",
        "groupMember" as "groupsMembers",
        "link" as "links"
      FROM "event_v2" "event"
      LEFT JOIN
        "actor" "actor" ON "event"."payload" ->> 'actors' = "actor"."id"::varchar
      LEFT JOIN
        "group" "group" ON "event"."payload" ->> 'groups' = "group"."id"::varchar
      LEFT JOIN
        "group_member" "groupMember" ON "event"."payload" ->> 'groupsMembers' = "groupMember"."id"::varchar
      WHERE type = 'Uncategorized'
  `,
})
export class UncategorizedEventEntity {
  @ViewColumn()
  id: string;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  payload: UncategorizedV2Payload;

  @ViewColumn()
  actors: ActorEntity[];

  @ViewColumn()
  groups: GroupEntity[];

  @ViewColumn()
  groupsMembers: GroupMemberEntity[];

  @ViewColumn()
  links: LinkEntity[];

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;

  @ViewColumn()
  deletedAt: Date | null;
}
