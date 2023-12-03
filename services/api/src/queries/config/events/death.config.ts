import { type EventQueryConfig } from "../EventQueryConfig";

export const Death: EventQueryConfig = {
  whereActorsIn: (qb) =>
    qb.andWhere(` "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors] `),
  whereGroupsIn: (qb) =>
    qb.andWhere(
      ` "event"."payload"::jsonb ->> 'type' = 'Quote' AND "event"."payload" IS NULL `,
    ),
  whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'victim'::text`,
};
