import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { Equal, Raw } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { type RouteContext } from "../route.types.js";
import { toActorIO } from "./actor.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";

export const MakeGetActorRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Actor.Get, ({ params: { id } }) => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
        actor: ctx.db.findOneOrFail(ActorEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["memberIn"],
          },
        }),
        events: ctx.db.find(EventV2Entity, {
          select: ["id", "payload"],
          where: {
            payload: Raw(
              (alias) => `${alias} ::jsonb -> 'actors' ?| ARRAY[:...actors]`,
              { actors: [id] },
            ),
          },
        }),
      }),
      TE.chain(({ actor, events }) => {
        ctx.logger.debug.log("Actor %O", actor);
        ctx.logger.debug.log("Actor events %O", events);
        return pipe(
          toActorIO({ ...actor, events: events.map((e) => e.id as any) }),
          TE.fromEither,
        );
      }),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      })),
    );
  });
};
