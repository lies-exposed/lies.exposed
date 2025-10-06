import { Brackets } from "typeorm";
import { type EventQueryConfig } from "../EventQueryConfig.js";

export const Book: EventQueryConfig = {
  whereActorsIn: (qb, _actorIds) => {
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
  whereGroupsIn: (qb, _groupIds) => {
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
  whereMediaIn: (qb) => {
    return qb
      .where(`"event"."payload"::jsonb -> 'media' -> 'pdf' ?| array[:...media]`)
      .orWhere(
        `"event"."payload"::jsonb -> 'media' -> 'audio' ?| array[:...media]`,
      );
  },
  whereTitleIn: () => `"event"."payload"::jsonb ->> 'title'::text`,
};
