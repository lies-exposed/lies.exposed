import { type EventQueryConfig } from "../EventQueryConfig.js";

export const Death: EventQueryConfig = {
  whereActorsIn: (qb) =>
    qb.andWhere(` "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors] `),
  whereGroupsIn: (qb) =>
    qb.andWhere(
      ` "event"."payload"::jsonb ->> 'type' = 'Quote' AND "event"."payload" IS NULL `,
    ),
  whereMediaIn: (qb) => qb.andWhere("media.id IN (:...media)"),
  whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'victim'::text`,
};
