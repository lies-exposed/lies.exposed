import { type EventType } from "@liexp/shared/lib/io/http/Events";
import { type EventQueryConfig } from './EventQueryConfig';
import { Book } from './events/book.config';
import { Death } from './events/death.config';
import { Patent } from './events/patent.config';

export type EventsConfig = {
  [K in EventType]: EventQueryConfig;
};

export const EventsConfig: EventsConfig = {
  Book,
  Death,
  ScientificStudy: {
    whereActorsIn: (qb) =>
      qb
      .andWhere(
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
  Patent,
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
      qb.andWhere(
        ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groups' ?| ARRAY[:...groups] ) `,
      ),
    whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'`,
  },
};
