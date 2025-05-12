import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import type * as http from "@liexp/shared/lib/io/http/index.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
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
    fp.RTE.map(({ keywords, links, media }): DeepPartial<EventV2Entity> => {
      const commonProps = {
        links: [...links],
        media: [...media],
        keywords: [...keywords],
      };
      switch (input.type) {
        case EVENT_TYPES.PATENT: {
          const { type, date, draft, excerpt, payload } = input;
          return {
            ...commonProps,
            type,
            draft,
            payload,
            date,
            excerpt,
          };
        }
        case EVENT_TYPES.DEATH: {
          const { type, date, draft, excerpt, payload } = input;
          return {
            ...commonProps,
            type,
            draft,
            payload: {
              ...payload,
              location: O.getOrUndefined(payload.location),
            },
            date,
            excerpt,
          };
        }
        case EVENT_TYPES.QUOTE:
        case EVENT_TYPES.SCIENTIFIC_STUDY:
        case EVENT_TYPES.BOOK:
        case EVENT_TYPES.DOCUMENTARY:
        case EVENT_TYPES.TRANSACTION: {
          const { type, draft, excerpt, date, payload } = input;
          return {
            ...commonProps,
            type,
            draft,
            excerpt,
            date,
            payload,
          };
        }
        case EVENT_TYPES.UNCATEGORIZED:
        default: {
          const { excerpt, type, draft, date, payload } = input;
          return {
            ...commonProps,
            type,
            date,
            draft,
            excerpt,
            payload: {
              ...payload,
              location: O.getOrUndefined(payload.location),
              endDate: O.getOrUndefined(payload.endDate),
            },
          };
        }
      }
    }),
  );
};
