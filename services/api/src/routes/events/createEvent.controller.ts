import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { URL, UUID } from "@econnessione/shared/io/http/Common";
import { uuid } from "@econnessione/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { MediaEntity } from "@entities/Media.entity";
import { ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

export const MakeCreateEventRoute: Route = (r, { db, logger, urlMetadata }) => {
  AddEndpoint(r)(Endpoints.Event.Create, ({ body }) => {
    const makeDataTask = pipe(
      sequenceS(TE.ApplicativePar)({
        event: TE.right({
          ...body,
          groups: body.groups.map((id) => ({ id })),
          actors: body.actors.map((id) => ({ id })),
          groupsMembers: body.groupsMembers.map((id) => ({ id })),
          media: pipe(
            body.media,
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
          endDate: O.toUndefined(body.endDate),
          keywords: body.keywords.map((k) =>
            UUID.is(k) ? { id: k } : { id: uuid(), tag: k.tag }
          ),
        }),
        links: pipe(
          body.links,
          A.filter(t.type({ url: URL }).is),
          A.map((link) =>
            pipe(
              urlMetadata.fetchMetadata(link.url, (e) => ServerError()),
              TE.map((metadata) => ({ ...link, ...metadata, keywords: [] }))
            )
          ),
          TE.sequenceSeqArray,
          // TE.chain(links => pipe(
          //   links.map(l => {
          //     return pipe(
          //       l.keywords?.map(Tag.decode) ?? [],
          //       A.sequence(E.Applicative),
          //       E.mapLeft(DecodeError),
          //       E.map(keywords => ({
          //         ...l,
          //         keywords
          //       }))
          //     )
          //   }),
          //   A.sequence(E.Applicative),
          //   TE.fromEither
          // )),
          TE.map((links) =>
            links.map((l) => ({
              ...l,
              keywords: l.keywords?.map((k) => ({ id: uuid(), tag: k })),
              id: uuid(),
            }))
          )
        ),
      }),
      TE.map(({ event, links }) => ({ ...event, links }))
    );

    return pipe(
      makeDataTask,
      // logger.info.logInTaskEither("Create data %O"),
      TE.chain((data) => db.save(EventEntity, [data])),
      TE.chain(([event]) =>
        db.findOneOrFail(EventEntity, {
          where: { id: event.id },
          relations: ["media"],
          loadRelationIds: {
            relations: [
              "actors",
              "groups",
              "groupsMembers",
              "links",
              "keywords",
            ],
          },
        })
      ),
      TE.chain((event) => TE.fromEither(toEventIO(event))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
