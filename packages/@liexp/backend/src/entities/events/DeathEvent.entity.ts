import { type DeathPayload } from "@liexp/shared/lib/io/http/Events/Death.js";
import { ViewColumn, ViewEntity } from "typeorm";
import { type ActorEntity } from "../Actor.entity.js";
import { type LinkEntity } from "../Link.entity.js";

@ViewEntity({
  expression: `
      SELECT
        "event"."id" AS "id",
        "event"."date" as "date",
        "event"."payload" AS "payload",
        "actor" as "victim"
      FROM "event_v2" "event"
      LEFT JOIN "actor" "actor" ON "event"."payload" ->> 'victim' = "actor"."id"::varchar
      WHERE type = 'Death'
  `,
})
export class DeathEventViewEntity {
  @ViewColumn()
  id: string;

  @ViewColumn()
  date: Date;

  @ViewColumn()
  victim: ActorEntity;

  @ViewColumn()
  payload: DeathPayload;

  @ViewColumn()
  links: LinkEntity[];

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;

  @ViewColumn()
  deletedAt: Date | null;
}
