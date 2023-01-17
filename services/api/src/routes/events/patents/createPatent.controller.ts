import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { sequenceS } from "fp-ts/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal, In } from "typeorm";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { createEventQuery } from "../queries/createEvent.query";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { ControllerError } from "@io/ControllerError";

export const MakeCreatePatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.PatentEvent.Create,
    ({
      body: {
        links,
        keywords,
        media,
        payload: { owners, ...payload },
        ...body
      },
    }) => {
      ctx.logger.debug.log(
        "Create patent from url %s with owners %O and props %O",
        payload.source,
        owners,
        body
      );

      const fetchOwnersTask = sequenceS(TE.ApplicativePar)({
        actors: pipe(
          owners.actors,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((gg) =>
            ctx.db.find(ActorEntity, {
              where: { id: In(gg) },
            })
          ),
          O.getOrElse(() => TE.right<ControllerError, ActorEntity[]>([]))
        ),
        groups: pipe(
          owners.groups,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((gg) =>
            ctx.db.find(GroupEntity, {
              where: { id: In(gg) },
            })
          ),
          O.getOrElse(() => TE.right<ControllerError, GroupEntity[]>([]))
        ),
      });

      return pipe(
        fetchOwnersTask,
        TE.chain(({ actors, groups }) =>
          createEventQuery(ctx)({
            type: PATENT.value,
            ...body,
            payload: {
              ...payload,
              owners: {
                actors: actors.map((a) => a.id as UUID),
                groups: groups.map((g) => g.id as UUID),
              },
            },
            media,
            links,
            keywords,
          })
        ),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal( event.id) },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
