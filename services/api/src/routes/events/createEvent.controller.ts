import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Route } from "routes/route.types";

export const MakeCreateEventRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Event.Create, ({ body: { endDate, ...body } }) => {
    const optionalData = pipe(foldOptionals({ endDate }), (data) => ({
      ...data,
      groups: body.groups.map((id) => ({ id })),
      actors: body.actors.map((id) => ({ id })),
      groupsMembers: body.groupsMembers.map((id) => ({ id })),
      links: body.links.map(({ url, description }) => ({
        id: uuid(),
        url,
        description,
      })),
      images: pipe(
        body.images,
        O.map(
          A.map((image) => ({
            ...image,
            id: uuid(),
          }))
        ),
        O.getOrElse((): any[] => [])
      ),
    }));

    return pipe(
      db.save(EventEntity, [{ ...body, ...optionalData }]),
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
