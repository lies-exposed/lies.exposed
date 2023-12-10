import { type UncategorizedV2Payload } from "@liexp/shared/lib/io/http/Events/Uncategorized.js";
import { ViewColumn, ViewEntity } from "typeorm";
import { type LinkEntity } from "../Link.entity.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type GroupMemberEntity } from "#entities/GroupMember.entity.js";

@ViewEntity({
  expression: `
      SELECT
        "event"."id" AS "id",
        "event"."payload" AS "payload",
        "event"."date" as "date",
        "actor" as "actors",
        "group" as "groups",
        "groupMember" as "groupsMembers"
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
