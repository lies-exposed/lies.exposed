import { http } from "@liexp/shared/io";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { UUID } from "io-ts-types";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { addOrder } from '@utils/orm.utils';

interface SearchEventSuggestionFilter {
  status: O.Option<http.EventSuggestion.EventSuggestionStatus[]>;
  links: O.Option<UUID[]>;
  newLinks: O.Option<Array<Partial<http.Link.CreateLink>>>;
  order: Record<string, "ASC" | "DESC">;
}

export const searchEventSuggestion =
  (ctx: RouteContext) =>
  (
    filter: SearchEventSuggestionFilter
  ): TE.TaskEither<
    ControllerError,
    { total: number; data: EventSuggestionEntity[] }
  > => {
    ctx.logger.debug.log("Find event suggestion by filter %O", filter);

    const query = pipe(
      ctx.db.manager
        .createQueryBuilder(EventSuggestionEntity, "eventSuggestion")
        .select(),
      (q) => {
        if (O.isSome(filter.status)) {
          q.where("status IN (:...status)", { status: filter.status.value });
        }

        if (O.isSome(filter.links)) {
          q.andWhere(
            `"eventSuggestion"."payload"::jsonb -> 'event' -> 'links' ?| ARRAY[:...links]`,
            {
              links: filter.links.value,
            }
          );
        }

        if (O.isSome(filter.newLinks)) {
          q.where(
            `"eventSuggestion"."payload"::jsonb -> 'event' -> 'links' @> ANY(ARRAY[:...links]::jsonb[])`,
            {
              links: filter.newLinks.value,
            }
          );
        }
        return q;
      },
      (q) => {
        addOrder(filter.order, q, "eventSuggestion");
        // ctx.logger.debug.log("Query %O", q.getQueryAndParameters());
        return q;
      }
    );

    return pipe(
      ctx.db.execQuery(() => query.getManyAndCount()),
      ctx.logger.debug.logInTaskEither(`Results %O`),
      TE.map(([data, total]) => ({ data, total }))
    );
  };
