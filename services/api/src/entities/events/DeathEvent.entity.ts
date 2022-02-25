import { DeathPayload } from "@liexp/shared/io/http/Events/Death";
import { ViewColumn, ViewEntity } from "typeorm";
import { LinkEntity } from "../Link.entity";
import { ActorEntity } from "@entities/Actor.entity";

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
