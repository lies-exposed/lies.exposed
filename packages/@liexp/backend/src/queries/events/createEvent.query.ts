import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { fetchRelationIds } from "./fetchEventRelations.query.js";

export const createEventQuery = <
  C extends DatabaseContext & URLMetadataContext & LoggerContext,
>(
  input: http.Events.CreateEventPlainBody,
): ReaderTaskEither<C, DBError, DeepPartial<EventV2Entity>> => {
  return pipe(
    fetchRelationIds({
      links: pipe(input.links, O.fromNullable, O.filter(isNonEmpty)),
      media: pipe(input.media, O.fromNullable, O.filter(isNonEmpty)),
      keywords: pipe(input.keywords, O.fromNullable, O.filter(isNonEmpty)),
    }),
    fp.RTE.chainTaskEitherK(({ keywords, links, media }) => {
      switch (input.type) {
        case http.Events.EventTypes.PATENT.Type: {
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
        case http.Events.EventTypes.DEATH.Type: {
          const { type, date, draft, excerpt, payload } = input;
          return TE.right({
            type,
            draft,
            payload: {
              ...payload,
              location: O.getOrUndefined(payload.location),
            },
            date,
            excerpt,
            keywords,
            links,
            media,
          });
        }
        case http.Events.EventTypes.QUOTE.Type:
        case http.Events.EventTypes.SCIENTIFIC_STUDY.Type:
        case http.Events.EventTypes.BOOK.Type:
        case http.Events.EventTypes.DOCUMENTARY.Type:
        case http.Events.EventTypes.TRANSACTION.Type: {
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
        case http.Events.EventTypes.UNCATEGORIZED.Type:
        default: {
          const { excerpt, type, draft, date, payload } = input;
          const uncategorizedEvent: DeepPartial<EventV2Entity> = {
            type,
            date,
            draft,
            excerpt,
            payload: {
              ...payload,
              location: O.getOrUndefined(payload.location),
              endDate: O.getOrUndefined(payload.endDate),
            },
            keywords: [...keywords],
            links: [...links],
            media: [...media],
          };
          return TE.right(uncategorizedEvent);
        }
      }
    }),
  );
};
