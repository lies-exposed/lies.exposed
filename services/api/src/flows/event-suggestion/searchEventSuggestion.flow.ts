import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { addOrder } from "#utils/orm.utils.js";

interface SearchEventSuggestionFilter {
  status: O.Option<http.EventSuggestion.EventSuggestionStatus[]>;
  links: O.Option<UUID[]>;
  newLinks: O.Option<Partial<http.Link.CreateLink>[]>;
  order: Record<string, "ASC" | "DESC">;
  skip: number;
  take: number;
  creator: O.Option<UUID>;
}

export const searchEventSuggestion: TEFlow<
  [SearchEventSuggestionFilter],
  { total: number; data: EventSuggestionEntity[] }
> =
  (ctx) =>
  ({ skip, take, ...filter }) => {
    ctx.logger.debug.log("Find event suggestion by filter %O", filter);

    const query = pipe(
      ctx.db.manager
        .createQueryBuilder(EventSuggestionEntity, "eventSuggestion")
        .select()
        .leftJoinAndSelect("eventSuggestion.creator", "creator"),
      (q) => {
        if (O.isSome(filter.status)) {
          q.where("eventSuggestion.status IN (:...status)", {
            status: filter.status.value,
          });
        }

        if (O.isSome(filter.links)) {
          q.andWhere(
            `"eventSuggestion"."payload"::jsonb -> 'event' -> 'links' ?| ARRAY[:...links]`,
            {
              links: filter.links.value,
            },
          );
        }

        if (O.isSome(filter.newLinks)) {
          q.where(
            `"eventSuggestion"."payload"::jsonb -> 'event' -> 'links' @> ANY(ARRAY[:...links]::jsonb[])`,
            {
              links: filter.newLinks.value,
            },
          );
        }

        if (O.isSome(filter.creator)) {
          q.andWhere(`creator.id = :creator`, {
            creator: filter.creator.value,
          });
        }
        return q;
      },
      (q) => {
        addOrder(filter.order, q, "eventSuggestion");
        // ctx.logger.debug.log("Query %O", q.getQueryAndParameters());
        return q.skip(skip).take(take);
      },
    );

    return pipe(
      ctx.db.execQuery(() => query.getManyAndCount()),
      TE.map(([data, total]) => ({ data, total })),
    );
  };
