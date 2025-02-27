import { type EventQueryConfig } from "../EventQueryConfig.js";

export const Patent: EventQueryConfig = {
  whereActorsIn: (qb) =>
    qb.andWhere(
      ` "event"."payload"::jsonb -> 'owners' -> 'actors' ?| ARRAY[:...actors] `,
    ),
  whereGroupsIn: (qb) =>
    qb.andWhere(
      ` (event.type = 'Patent' AND "event"."payload"::jsonb -> 'owners' -> 'groups' ?| ARRAY[:...groups])`,
    ),
  whereMediaIn: (qb) => qb.andWhere("media.id IN (:...media)"),
  whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
};
