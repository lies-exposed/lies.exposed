import * as http from "@liexp/shared/io/http";
import { CreateLink } from "@liexp/shared/io/http/Link";
import { URLMetadataClient } from "@liexp/shared/providers/URLMetadata.provider";
import { uuid } from "@liexp/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { UUID } from "io-ts-types/lib/UUID";
import { DeepPartial } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { DBError } from "@providers/orm";
import { RouteContext } from "@routes/route.types";
import { optionalsToUndefined } from "@utils/foldOptionals.utils";

const linkTask =
  (urlMetadata: URLMetadataClient) =>
  (
    links: Array<http.Common.UUID | CreateLink>
  ): TE.TaskEither<DBError, Array<DeepPartial<LinkEntity>>> => {
    return pipe(
      links,
      A.reduce(
        { uuids: [] as UUID[], newLinks: [] as CreateLink[] },
        (acc, l) => {
          if (http.Common.UUID.is(l)) {
            return {
              ...acc,
              uuids: acc.uuids.concat(l),
            };
          }
          return {
            ...acc,
            newLinks: acc.newLinks.concat(l),
          };
        }
      ),
      ({ newLinks, uuids }) => {
        return pipe(
          sequenceS(TE.ApplicativePar)({
            linkWithMetadata: pipe(
              newLinks,
              A.map((link) =>
                pipe(
                  urlMetadata.fetchMetadata(link.url, (e) => ServerError()),
                  TE.map((metadata) => ({
                    ...link,
                    ...metadata,
                    keywords: [],
                    events: [],
                    id: uuid(),
                  }))
                )
              ),
              TE.sequenceSeqArray
            ),

            linkUUIDs: pipe(
              uuids,
              A.map((id): DeepPartial<LinkEntity> => ({ id })),
              TE.right
            ),
          }),
          TE.map(({ linkWithMetadata, linkUUIDs }) =>
            linkUUIDs.concat(linkWithMetadata)
          )
        );
      }
    );
  };

export const editEventQuery =
  ({ urlMetadata }: RouteContext) =>
  (
    storedEvent: EventV2Entity,
    input: http.Events.EditEventBody
  ): TE.TaskEither<DBError, DeepPartial<EventV2Entity>> => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
        links: pipe(
          input.links,
          O.getOrElse((): any[] => []),
          linkTask(urlMetadata)
        ),
        media: pipe(
          input.media,
          O.getOrElse((): any[] => []),
          A.map((i) =>
            UUID.is(i)
              ? { id: i }
              : {
                  id: uuid(),
                  ...i,
                }
          ),
          TE.right
        ),
        keywords: pipe(
          input.keywords,
          O.getOrElse((): UUID[] => []),
          A.map((k) => ({ id: k })),
          TE.right
        ),
      }),
      TE.chain((commonData) => {
        switch (input.type) {
          case http.Events.Transaction.TRANSACTION.value: {
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: DeepPartial<EventV2Entity> = {
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
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: DeepPartial<EventV2Entity> = {
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
            const { excerpt, body, payload, date } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
              date,
            });
            const event: DeepPartial<EventV2Entity> = {
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
            const { excerpt, body, payload } = input;
            const baseProps = optionalsToUndefined({
              excerpt,
              body,
            });
            const event: DeepPartial<EventV2Entity> = {
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
