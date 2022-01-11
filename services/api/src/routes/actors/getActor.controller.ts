import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { ActorEntity } from "../../entities/Actor.entity";
import { toActorIO } from "./actor.io";
import { RouteContext } from "routes/route.types";

export const MakeGetActorRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Actor.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ActorEntity, {
        where: { id },
        loadRelationIds: {
          relations: ['memberIn']
        }
      }),
      TE.chainEitherK(toActorIO),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      }))
    );
  });
};
