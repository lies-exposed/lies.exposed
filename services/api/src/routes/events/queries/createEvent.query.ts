import * as http from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { DeepPartial } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ServerError } from "@io/ControllerError";
import { DBError } from "@providers/orm";
import { RouteContext } from "@routes/route.types";

export const createEventQuery =
  ({ urlMetadata }: RouteContext) =>
  (
    input: http.Events.CreateEventBody
  ): TE.TaskEither<DBError, DeepPartial<EventV2Entity>> => {
    const {
      media: _media,
      links: _links,
      keywords: _keywords,
      ...rest
    } = input;
    const media = pipe(
      _media,
      A.map((image) =>
        UUID.is(image)
          ? {
              id: image.toString(),
            }
          : {
              ...image,
              id: uuid(),
            }
      ),
      TE.right
    );

    const keywords = pipe(
      _keywords.map((k) => ({ id: k })),
      TE.right
    );
    const links = pipe(
      _links,
      A.filter(t.type({ url: http.Common.URL }).is),
      A.map((link) =>
        pipe(
          urlMetadata.fetchMetadata(link.url, (e) => ServerError()),
          TE.map((metadata) => ({ ...link, ...metadata, keywords: [] }))
        )
      ),
      TE.sequenceSeqArray,
      TE.map((links) =>
        links.map((l) => ({
          ...l,
          keywords: l.keywords?.map((k) => ({ id: uuid(), tag: k })),
          id: uuid(),
        }))
      )
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        keywords,
        links,
        media,
        input: TE.right({ ...rest }),
      }),
      TE.chain(({ keywords, links, media, input }) => {
        switch (input.type) {
          case http.Events.Patent.PATENT.value: {
            const { type, date, draft, excerpt, payload } = input;
            return TE.right({
              type: type,
              draft,
              payload: {
                ...payload,
                owners: {
                  actors: pipe(
                    payload.owners.actors,
                    O.getOrElse((): string[] => [])
                  ),
                  groups: pipe(
                    payload.owners.groups,
                    O.getOrElse((): string[] => [])
                  ),
                },
              },
              date,
              excerpt,
              keywords,
              links,
              media,
            });
          }
          case http.Events.Death.DEATH.value: {
            const { type, date, draft, excerpt, payload } = input;
            return TE.right({
              type: type,
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
          case http.Events.ScientificStudy.ScientificStudyType.value: {
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
          case http.Events.Uncategorized.UncategorizedType.value:
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
