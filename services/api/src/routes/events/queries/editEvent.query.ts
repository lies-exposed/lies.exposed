import * as http from "@liexp/shared/io/http";
import { DBError } from "@liexp/shared/providers/orm";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { DeepPartial } from "typeorm";
import { fetchRelations } from "./fetchEventRelations.utils";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { RouteContext } from "@routes/route.types";
import { optionalsToUndefined } from "@utils/foldOptionals.utils";

interface EditEventEntity extends Omit<DeepPartial<EventV2Entity>, "type"> {
  type: http.Events.EventType;
}

export const editEventQuery =
  (ctx: RouteContext) =>
  (
    storedEvent: EventV2Entity,
    input: http.Events.EditEventBody
  ): TE.TaskEither<DBError, EditEventEntity> => {
    return pipe(
      fetchRelations(ctx)(input),
      TE.chain((commonData) => {
        const media = commonData.media.concat(
          storedEvent.media.filter(
            (l) => !commonData.media.find((ll) => ll.id === l.id)
          )
        );
        const links = commonData.links.concat(
          storedEvent.links.filter(
            (l) => !commonData.links.find((ll) => ll.id === l.id)
          )
        );
        const keywords = commonData.keywords.concat(
          storedEvent.keywords.filter(
            (l) => !commonData.keywords.find((ll) => ll.id === l.id)
          )
        );
        const newRelations = {
          links,
          keywords,
          media
        }

        switch (input.type) {
          case http.Events.Transaction.TRANSACTION.value: {
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...newRelations,
            };
            return TE.right(event);
          }
          case http.Events.Documentary.DOCUMENTARY.value: {
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...newRelations,
            };
            return TE.right(event);
          }
          case http.Events.Patent.PATENT.value: {
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: EditEventEntity = {
              ...storedEvent,
              ...baseProps,
              type: input.type,
              payload: {
                ...storedEvent.payload,
                ...payload,
              },
              ...newRelations,
            };
            return TE.right(event);
          }
          case http.Events.Death.DEATH.value: {
            const { excerpt, body, payload } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
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
              ...newRelations,
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
              ...newRelations,
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
                ...newRelations,
                type,
                payload: p,
              }))
            );
          }
        }
      })
    );
  };
