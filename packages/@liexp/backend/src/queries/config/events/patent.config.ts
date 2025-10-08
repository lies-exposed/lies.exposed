import { type EventQueryConfig } from "../EventQueryConfig.js";

export const Patent: EventQueryConfig = {
  whereActorsIn: (qb, _actorIds) =>
    qb.andWhere(
      ` "event"."payload"::jsonb -> 'owners' -> 'actors' ?| ARRAY[:...actors] `,
    ),
  whereGroupsIn: (qb, _groupIds) =>
    qb.andWhere(
      ` (event.type = 'Patent' AND "event"."payload"::jsonb -> 'owners' -> 'groups' ?| ARRAY[:...groups])`,
    ),
  whereMediaIn: (qb, _mediaIds) => qb.andWhere("media.id IN (:...media)"),
  whereTitleIn: (_qb) => `"event"."payload"::jsonb ->> 'title'`,
};
