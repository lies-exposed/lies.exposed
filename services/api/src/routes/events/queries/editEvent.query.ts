import * as http from "@econnessione/shared/io/http";
import { CreateLink } from "@econnessione/shared/io/http/Link";
import { URLMetadataClient } from "@econnessione/shared/providers/URLMetadata.provider";
import { uuid } from "@econnessione/shared/utils/uuid";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { DBError } from "@providers/orm";
import { RouteContext } from "@routes/route.types";
import {
  defaultOptionals,
  optionalsToUndefined,
} from "@utils/foldOptionals.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types/lib/UUID";
import { DeepPartial } from "typeorm";

const linkTask =
  (urlMetadata: URLMetadataClient) =>
  (
    links: Array<http.Common.UUID | CreateLink>
  ): TE.TaskEither<DBError, DeepPartial<LinkEntity>[]> => {
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
          case http.Events.Death.DeathType.value: {
            const { type, links, media, keywords, draft, date, ...payload } =
              input;
            const baseProps = optionalsToUndefined({
              draft,
              date,
            });

            const event: DeepPartial<EventV2Entity> = {
              ...storedEvent,
              ...baseProps,
              type,
              payload: {
                ...storedEvent.payload,
                ...defaultOptionals({ ...payload }, {}),
              },
              ...commonData,
            };
            return TE.right(event);
          }
          case http.Events.ScientificStudy.ScientificStudyType.value: {
            const {
              type,
              media,
              keywords,
              links,
              title,
              date,
              draft,
              ...payload
            } = input;
            const baseProps = optionalsToUndefined({
              title,
              date,
              draft,
            });
            return TE.right({
              ...storedEvent,
              ...baseProps,
              type,
              payload: {
                ...storedEvent.payload,
                ...optionalsToUndefined({
                  ...payload,
                }),
              },
              ...commonData,
            });
          }
          case http.Events.Uncategorized.UncategorizedType.value:
          default: {
            const {
              type,
              media,
              keywords,
              links,
              location,
              excerpt,
              draft,
              date,
              ...payload
            } = input;

            const baseProps = optionalsToUndefined({
              draft,
              date,
              excerpt,
            });

            return TE.right({
              ...storedEvent,
              ...baseProps,
              type,
              payload: {
                ...storedEvent.payload,
                ...defaultOptionals({ ...payload }, storedEvent.payload as any),
              },
              ...commonData,
            });
          }
        }
      })
    );
  };
