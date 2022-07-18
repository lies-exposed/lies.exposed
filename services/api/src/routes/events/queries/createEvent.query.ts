import * as http from "@liexp/shared/io/http";
import { DBError } from "@liexp/shared/providers/orm";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { DeepPartial } from "typeorm";
import { fetchRelations } from "./fetchEventRelations.utils";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { RouteContext } from "@routes/route.types";

export const createEventQuery =
  (ctx: RouteContext) =>
  (
    input: http.Events.CreateEventBody
  ): TE.TaskEither<DBError, DeepPartial<EventV2Entity>> => {
    return pipe(
      fetchRelations(ctx)({
        links: pipe(
          input.links,
          O.fromPredicate((arr) => arr.length > 0)
        ),
        media: pipe(
          input.media,
          O.fromPredicate((arr) => arr.length > 0)
        ),
        keywords: pipe(
          input.keywords,
          O.fromPredicate((arr) => arr.length > 0)
        ),
      }),
      TE.chain(({ keywords, links, media }) => {
        switch (input.type) {
          case http.Events.Patent.PATENT.value: {
            const { type, date, draft, excerpt, payload } = input;
            return TE.right({
              type,
              draft,
              payload: {
                ...payload,
              },
              date,
              excerpt,
              keywords,
              links,
              media,
            } as any);
          }
          case http.Events.Death.DEATH.value: {
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
          case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
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
          case http.Events.Documentary.DOCUMENTARY.value: {
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
          case http.Events.Transaction.TRANSACTION.value: {
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
          case http.Events.Uncategorized.UNCATEGORIZED.value:
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
      })
    );
  };
