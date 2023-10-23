import { type EventType } from "@liexp/shared/lib/io/http/Events";
import { type WhereExpressionBuilder } from "typeorm";

interface EventQueryConfig {
  whereActorsIn: (qb: WhereExpressionBuilder) => WhereExpressionBuilder;
  whereGroupsIn: (qb: WhereExpressionBuilder) => WhereExpressionBuilder;
  whereTitleIn: (qb: WhereExpressionBuilder) => string;
}

export type EventsConfig = {
  [K in EventType]: EventQueryConfig;
};

export const EventsConfig: EventsConfig = {
  Death: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        ` "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors] `,
      ),
    whereGroupsIn: (qb) => qb.andWhere(
      ` "event"."payload"::jsonb ->> 'type' = 'Quote' AND "event"."payload" IS NULL `,
    ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'victim'::text`,
  },
  ScientificStudy: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        ` "event"."payload"::jsonb -> 'authors' ?| ARRAY[:...actors] `,
      ),
    whereGroupsIn: (qb) =>
      qb.andWhere(
        ` (event.type = 'ScientificStudy' AND "event"."payload"::jsonb -> 'publisher' ?| ARRAY[:...groups])`,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
  },
  Documentary: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        `( "event"."payload"::jsonb -> 'subjects' -> 'actors' ?| ARRAY[:...actors] OR "event"."payload"::jsonb -> 'authors' -> 'actors' ?| ARRAY[:...actors] )`,
      ),
    whereGroupsIn: (qb) =>
      qb.andWhere(
        `(event.type = 'Documentary' AND ( "event"."payload"::jsonb -> 'subjects' -> 'groups' ?| ARRAY[:...groups] OR "event"."payload"::jsonb -> 'authors' -> 'groups' ?| ARRAY[:...groups] ) )`,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
  },
  Patent: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        ` "event"."payload"::jsonb -> 'owners' -> 'actors' ?| ARRAY[:...actors] `,
      ),
    whereGroupsIn: (qb) =>
      qb.andWhere(
        ` (event.type = 'Patent' AND "event"."payload"::jsonb -> 'owners' -> 'groups' ?| ARRAY[:...groups])`,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
  },
  Transaction: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        `( ("event"."payload"::jsonb -> 'from' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'from' -> 'id' ?| ARRAY[:...actors]) OR ` +
          ` ("event"."payload"::jsonb -> 'to' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'to' -> 'id' ?| ARRAY[:...actors]) )`,
      ),
    whereGroupsIn: (qb) =>
      qb
        .where(" event.type = 'Transaction' ")
        .andWhere(
          `( ("event"."payload"::jsonb -> 'from' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'from' -> 'id' ?| ARRAY[:...groups]) OR ` +
            ` ("event"."payload"::jsonb -> 'to' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'to' -> 'id' ?| ARRAY[:...groups]) )`,
        ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'description'`,
  },
  Quote: {
    whereActorsIn: (qb) =>
      qb.andWhere(
        ` ( ("event"."payload"::jsonb -> 'subject' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'subject' -> 'id' ?| ARRAY[:...actors]) OR "event"."payload"::jsonb -> 'actor' ?| ARRAY[:...actors] ) `,
      ),
    whereGroupsIn: (qb) =>
      qb.andWhere(
        ` (event.type = 'Quote' AND "event"."payload"::jsonb -> 'subject' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'subject' -> 'id' ?| ARRAY[:...groups])`,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'quote'::text`,
  },
  Uncategorized: {
    whereActorsIn: (qb) =>
      qb.andWhere(`"event"."payload"::jsonb -> 'actors' ?| ARRAY[:...actors] `),
    whereGroupsIn: (qb) =>
      qb.where(
        ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groups' ?| ARRAY[:...groups]) `,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
  },
};
