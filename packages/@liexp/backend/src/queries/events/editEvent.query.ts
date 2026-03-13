import { pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { foldOptionals } from "../../utils/foldOptionals.utils.js";
import { fetchRelationIds } from "./fetchEventRelations.query.js";

interface EditEventEntity extends Omit<DeepPartial<EventV2Entity>, "type"> {
  type: Events.EventType;
}

export const editEventQuery =
  (storedEvent: EventV2Entity, input: Events.EditEventBody) =>
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
          case EVENT_TYPES.BOOK:
          case EVENT_TYPES.QUOTE:
          case EVENT_TYPES.TRANSACTION:
          case EVENT_TYPES.DOCUMENTARY:
          case EVENT_TYPES.PATENT:
          case EVENT_TYPES.DEATH:
          case EVENT_TYPES.SCIENTIFIC_STUDY: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = foldOptionals({
              excerpt,
              body,
              date,
              draft,
            });
            const unwrappedPayload = foldOptionals(payload as any);
            const mergedPayload = {
              ...storedEvent.payload,
              ...unwrappedPayload,
            };
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: mergedPayload,
              ...commonData,
            };
            return TE.right(event);
          }
          case EVENT_TYPES.UNCATEGORIZED:
          default: {
            const { type, excerpt, draft, date, body, payload } = input;
            const baseProps = foldOptionals({
              draft,
              date,
              excerpt,
              body,
            });
            const unwrappedPayload = foldOptionals(payload as any);
            const mergedPayload = {
              ...storedEvent.payload,
              ...unwrappedPayload,
            };
            return TE.right({
              ...storedEvent,
              ...baseProps,
              ...commonData,
              type,
              payload: mergedPayload,
            });
          }
        }
      }),
    );
  };
