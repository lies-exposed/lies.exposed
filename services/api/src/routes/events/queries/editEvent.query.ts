import * as http from "@econnessione/shared/io/http";
import { uuid } from "@econnessione/shared/utils/uuid";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { MediaEntity } from "@entities/Media.entity";
import { ServerError } from "@io/ControllerError";
import { DBError } from "@providers/orm";
import { RouteContext } from "@routes/route.types";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { DeepPartial } from "typeorm";

export const editEventQuery =
  ({ urlMetadata }: RouteContext) =>
  (
    input: http.Events.EditEventBody
  ): TE.TaskEither<DBError, DeepPartial<EventV2Entity>> => {
    // const updateData = foldOptionals({
    //   ...body,
    //   actors: pipe(actors, O.map(A.map((a) => ({ id: a })))),
    //   groups: pipe(groups, O.map(A.map((g) => ({ id: g })))),
    //   groupsMembers: pipe(groupsMembers, O.map(A.map((g) => ({ id: g })))),
    //   keywords: pipe(keywords, O.map(A.map((k) => ({ id: k })))),
    //   links: pipe(
    //     links,
    //     O.map(A.map((l) => (UUID.is(l) ? { id: l } : { id: uuid(), ...l })))
    //   ),
    //   media: pipe(
    //     media,
    //     O.map(
    //       A.map((i) =>
    //         UUID.is(i)
    //           ? { id: i }
    //           : {
    //               id: uuid(),
    //               ...i,
    //             }
    //       )
    //     )
    //   ),
    // });
    switch (input.type) {
      case http.Events.Death.DeathType.value: {
        const { type, location, ...payload } = input;
        return TE.right({
          type: type,
          payload: {
            ...payload,
            location: O.toUndefined(location),
          },
        });
      }
      case http.Events.ScientificStudy.ScientificStudyType.value: {
        const { type, ...payload } = input;
        return TE.right({
          type,
          payload: {
            ...payload,
          },
          links: [],
          media: [],
        });
      }
      case http.Events.Uncategorized.UncategorizedType.value:
      default: {
        const {
          type,
          media,
          keywords,
          links,
          endDate,
          location,
          excerpt,
          ...payload
        } = input;

        return pipe(
          sequenceS(TE.ApplicativePar)({
            event: TE.right({
              ...input,
              excerpt: O.toUndefined(excerpt),
              payload: {
                location: O.toUndefined(location),
                ...payload,
                endDate: O.toUndefined(endDate),
                links: [],
              },
              media: pipe(
                input.media,
                O.map(
                  A.map((image) =>
                    UUID.is(image)
                      ? {
                          id: image.toString(),
                        }
                      : {
                          ...image,
                          id: uuid(),
                        }
                  )
                ),
                O.getOrElse((): Array<Partial<MediaEntity>> => [])
              ),
              keywords: pipe(
                keywords,
                O.getOrElse((): any[] => []),
                A.map((k) =>
                  UUID.is(k) ? { id: k } : { id: uuid(), tag: k.tag }
                )
              ),
              links: [],
            }),
            links: pipe(
              links,
              O.map((ll) =>
                pipe(
                  ll,
                  A.filter(t.type({ url: http.Common.URL }).is),
                  A.map((link) =>
                    pipe(
                      urlMetadata.fetchMetadata(link.url, (e) => ServerError()),
                      TE.map((metadata) => ({
                        ...link,
                        ...metadata,
                        keywords: [],
                      }))
                    )
                  ),
                  TE.sequenceSeqArray,
                  TE.map((links) =>
                    links.map((l) => ({
                      ...l,
                      keywords: l.keywords?.map((k) => ({
                        id: uuid(),
                        tag: k,
                      })),
                      id: uuid(),
                    }))
                  )
                )
              ),
              O.getOrElse(() => TE.right<DBError, any[]>([]))
            ),
          }),
          TE.map(({ event, links }) => ({
            ...event,
            links,
          }))
        );
      }
    }
  };
