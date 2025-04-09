import { pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import type * as http from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { optionalsToUndefined } from "../../utils/foldOptionals.utils.js";
import { fetchRelationIds } from "./fetchEventRelations.query.js";

interface EditEventEntity extends Omit<DeepPartial<EventV2Entity>, "type"> {
  type: http.Events.EventType;
}

export const editEventQuery =
  (storedEvent: EventV2Entity, input: http.Events.EditEventBody) =>
  <C extends LoggerContext & DatabaseContext & URLMetadataContext>(
    ctx: C,
  ): TE.TaskEither<DBError, EditEventEntity> => {
    return pipe(
      fetchRelationIds(input)(ctx),
      TE.map(({ links, keywords, media }) => ({
        links: [...links],
        keywords: [...keywords],
        media: [...media],
      })),
      TE.chain((commonData) => {
        ctx.logger.debug.log("event relations %O", commonData);
        // const oldMedia = storedEvent.media ?? [];
        // const media = commonData.media.concat(
        //   oldMedia.filter((l) => !commonData.media.find((ll) => ll.id === l.id))
        // );

        // const oldLinks = storedEvent.links ?? [];
        // const links = commonData.links.concat(
        //   oldLinks.filter((l) => !commonData.links.find((ll) => ll.id === l.id))
        // );

        // const oldKeywords = storedEvent.keywords ?? [];
        // const keywords = commonData.keywords.concat(
        //   oldKeywords.filter(
        //     (l) => !commonData.keywords.find((ll) => ll.id === l.id)
        //   )
        // );
        // const newRelations = {
        //   links,
        //   keywords,
        //   media,
        // };

        switch (input.type) {
          case EVENT_TYPES.BOOK: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.QUOTE: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.TRANSACTION: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.DOCUMENTARY: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.PATENT: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.DEATH: {
            const { excerpt, body, payload, draft, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
                location: O.toUndefined(payload.location),
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.SCIENTIFIC_STUDY: {
            const { type, date, draft, excerpt, body, payload } = input;
            const baseProps = optionalsToUndefined({
              date,
              draft,
              excerpt,
              body,
            });
            return TE.right({
              ...storedEvent,
              ...baseProps,
              type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...commonData,
            });
          }
          case EVENT_TYPES.UNCATEGORIZED:
          default: {
            const { type, excerpt, draft, date, body, payload } = input;

            const baseProps = optionalsToUndefined({
              draft,
              date,
              excerpt,
              body,
            });

            return pipe(
              {
                ...storedEvent.payload,
                ...payload,
                location: O.toUndefined(payload.location),
                endDate: O.toUndefined(payload.endDate),
              },
              TE.right,
              TE.map((p) => ({
                ...storedEvent,
                ...baseProps,
                ...commonData,
                type,
                payload: p,
              })),
            );
          }
        }
      }),
    );
  };
