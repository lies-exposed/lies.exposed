import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { fetchRelationIds } from "./fetchEventRelations.query.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const createEventQuery =
  (ctx: RouteContext) =>
  (
    input: http.Events.CreateEventBody,
  ): TE.TaskEither<DBError, DeepPartial<EventV2Entity>> => {
    return pipe(
      fetchRelationIds(ctx)({
        links: pipe(
          input.links,
          O.fromPredicate((arr) => arr.length > 0),
        ),
        media: pipe(
          input.media,
          O.fromPredicate((arr) => arr.length > 0),
        ),
        keywords: pipe(
          input.keywords,
          O.fromPredicate((arr) => arr.length > 0),
        ),
      }),
      TE.chain(({ keywords, links, media }) => {
        switch (input.type) {
          case http.Events.EventTypes.PATENT.value: {
            const { type, date, draft, excerpt, payload } = input;
            return TE.right({
              type,
              draft,
              payload,
              date,
              excerpt,
              keywords,
              links,
              media,
            } as any);
          }
          case http.Events.EventTypes.DEATH.value: {
            const { type, date, draft, excerpt, payload } = input;
            return TE.right({
              type,
              draft,
              payload: {
                ...payload,
                location: O.toUndefined(payload.location),
              },
              date,
              excerpt,
              keywords,
              links,
              media,
            });
          }
          case http.Events.EventTypes.QUOTE.value:
          case http.Events.EventTypes.SCIENTIFIC_STUDY.value:
          case http.Events.EventTypes.BOOK.value:
          case http.Events.EventTypes.DOCUMENTARY.value:
          case http.Events.EventTypes.TRANSACTION.value: {
            const { type, draft, excerpt, date, payload } = input;
            return TE.right({
              type,
              draft,
              excerpt,
              date,
              payload,
              keywords,
              links,
              media,
            });
          }
          case http.Events.EventTypes.UNCATEGORIZED.value:
          default: {
            const { excerpt, type, draft, date, payload } = input;
            const uncategorizedEvent: DeepPartial<EventV2Entity> = {
              type,
              date,
              draft,
              excerpt,
              payload: {
                ...payload,
                location: O.toUndefined(payload.location),
                endDate: O.toUndefined(payload.endDate),
              },
              keywords,
              links,
              media,
            };
            return TE.right(uncategorizedEvent);
          }
        }
      }),
    );
  };
