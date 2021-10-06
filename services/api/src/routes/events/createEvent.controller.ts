import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { ImageEntity } from "@entities/Image.entity";
import { ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

export const MakeCreateEventRoute: Route = (r, { db, urlMetadata }) => {
  AddEndpoint(r)(Endpoints.Event.Create, ({ body }) => {
    const makeDataTask = pipe(
      sequenceS(TE.ApplicativePar)({
        event: TE.right({
          ...body,
          groups: body.groups.map((id) => ({ id })),
          actors: body.actors.map((id) => ({ id })),
          groupsMembers: body.groupsMembers.map((id) => ({ id })),
          images: pipe(
            body.images,
            O.map(
              A.map((image) => ({
                ...image,
                createdAt: new Date(),
                updatedAt: new Date(),
                events: [],
                id: uuid(),
              }))
            ),
            O.getOrElse((): ImageEntity[] => [])
          ),
          endDate: O.toUndefined(body.endDate),
        }),
        links: pipe(
          body.links.map(({ url }) =>
            urlMetadata.fetchMetadata(url, (e) => ServerError())
          ),
          TE.sequenceSeqArray,
          TE.map((links) =>
            links.map((l) => ({
              ...l,
              id: uuid(),
            }))
          )
        ),
      }),
      TE.map(({ event, links }) => ({ ...event, links }))
    );

    return pipe(
      makeDataTask,
      TE.chain((data) => db.save(EventEntity, [data])),
      TE.chain(([event]) =>
        db.findOneOrFail(EventEntity, {
          where: { id: event.id },
          relations: ["images"],
          loadRelationIds: {
            relations: ["actors", "groups", "groupsMembers", "links"],
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
