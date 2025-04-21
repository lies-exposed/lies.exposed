import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { addOrder } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";

interface SearchEventSuggestionFilter {
  status: O.Option<readonly http.EventSuggestion.EventSuggestionStatus[]>;
  links: O.Option<readonly UUID[]>;
  newLinks: O.Option<readonly Partial<http.Link.CreateLink>[]>;
  order: Record<string, "ASC" | "DESC">;
  skip: number;
  take: number;
  creator: O.Option<UUID>;
}

export const searchEventSuggestion =
  ({
    skip,
    take,
    ...filter
  }: SearchEventSuggestionFilter): TEReader<{
    total: number;
    data: EventSuggestionEntity[];
  }> =>
  (ctx) => {
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
