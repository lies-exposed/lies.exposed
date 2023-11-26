import { Brackets } from "typeorm";
import { type EventQueryConfig } from "../EventQueryConfig";

export const Book: EventQueryConfig = {
  whereActorsIn: (qb, actorIds) => {
    // .where(
    //   ` "event"."payload"::jsonb @@ '$.authors[*] ? (@.type == "Actor").id @> any (array[]::jsonb[])' `,
    // )
    qb.andWhere(
      new Brackets((qqb) => {
        return qqb
          .where(
            `EXISTS (
              SELECT 1
              FROM jsonb_array_elements("event"."payload"::jsonb -> 'authors') AS "author"
              WHERE "event"."type" = 'Book'
              AND "author" ->> 'type' = 'Actor'
              AND "author" -> 'id' ?| ARRAY[:...actors]
            )`,
          )
          .orWhere(
            ` ( "event"."payload"::jsonb -> 'publisher' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'publisher' -> 'id' ?| ARRAY[:...actors] ) `,
          );
      }),
    );
    // .andWhere(
    //   `EXISTS (
    //       SELECT 1 FROM jsonb_array_elements("event"."payload"::jsonb -> 'authors') AS "author"
    //       WHERE "author" ->> 'type' = 'Actor'
    //       AND "author" -> 'id' @> any (array['${actorIds
    //         ?.map((id) => `"${id}"`)
    //         .join(",")}']::jsonb[])
    //     )`,
    // )

    return qb;
  },
  whereGroupsIn: (qb, groupIds) => {
    qb.andWhere(
      new Brackets((qqb) => {
        return qqb
          .where(
            `EXISTS (
              SELECT 1
              FROM jsonb_array_elements("event"."payload"::jsonb -> 'authors') AS "author"
              WHERE "event"."type" = 'Book'
              AND "author" ->> 'type' = 'Group'
              AND "author" -> 'id' ?| ARRAY[:...groups]
            )`,
          )
          .orWhere(
            ` ( "event"."payload"::jsonb -> 'publisher' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'publisher' -> 'id' ?| ARRAY[:...groups] )`,
          );
      }),
    );
    // .where(
    //   `"event"."payload"::jsonb @@ '$.authors[*] ? (@.type == "Actor" && @.id ?| array(:...actors) )'`,
    // )
    return qb;
  },
  whereTitleIn: (qb) => `"event"."payload"::jsonb ->> 'title'::text`,
};
