import { type EventQueryConfig } from "../EventQueryConfig.js";

export const Death: EventQueryConfig = {
  whereActorsIn: (qb, _actorIds) =>
    qb.andWhere(` "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors] `),
  whereGroupsIn: (qb, _groupIds) =>
    qb.andWhere(
      ` "event"."payload"::jsonb ->> 'type' = 'Quote' AND "event"."payload" IS NULL `,
    ),
  whereMediaIn: (qb, _mediaIds) => qb.andWhere("media.id IN (:...media)"),
  whereTitleIn: (_qb) => `"event"."payload"::jsonb ->> 'victim'::text`,
};
