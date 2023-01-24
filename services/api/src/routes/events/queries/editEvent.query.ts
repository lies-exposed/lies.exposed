import * as http from "@liexp/shared/io/http";
import { type DBError } from "@liexp/shared/providers/orm";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type DeepPartial } from "typeorm";
import { fetchRelationIds } from "./fetchEventRelations.utils";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type RouteContext } from "@routes/route.types";
import { optionalsToUndefined } from "@utils/foldOptionals.utils";

interface EditEventEntity extends Omit<DeepPartial<EventV2Entity>, "type"> {
  type: http.Events.EventType;
}

export const editEventQuery =
  (ctx: RouteContext) =>
  (
    storedEvent: EventV2Entity,
    input: http.Events.EditEventBody,
  ): TE.TaskEither<DBError, EditEventEntity> => {
    return pipe(
      fetchRelationIds(ctx)(input),
      TE.chain((commonData) => {
        ctx.logger.debug.log('event relations %O', commonData);
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
          case http.Events.Quote.QUOTE.value: {
            const { excerpt, body, payload, date , draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft
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
          case http.Events.Transaction.TRANSACTION.value: {
            const { excerpt, body, payload, date , draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft
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
          case http.Events.Documentary.DOCUMENTARY.value: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft
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
          case http.Events.Patent.PATENT.value: {
            const { excerpt, body, payload, date, draft } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft
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
          case http.Events.Death.DEATH.value: {
            const { excerpt, body, payload, draft, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
              draft
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
          case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
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
          case http.Events.Uncategorized.UNCATEGORIZED.value:
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
              }))
            );
          }
        }
      })
    );
  };
