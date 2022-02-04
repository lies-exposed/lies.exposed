import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Raw } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity";
import { RouteContext } from "../route.types";
import { toActorIO } from "./actor.io";
import { EventV2Entity } from "@entities/Event.v2.entity";

export const MakeGetActorRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Actor.Get, ({ params: { id } }) => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
        actor: ctx.db.findOneOrFail(ActorEntity, {
          where: { id },
          loadRelationIds: {
            relations: ["memberIn"],
          },
        }),
        events: ctx.db.find(EventV2Entity, {
          select: ["id", "payload"],
          where: {
            payload: Raw(
              (alias) => `${alias} ::jsonb -> 'actors' ?| ARRAY[:...actors]`,
              { actors: [id] }
            ),
          },
        }),
      }),
      TE.chain(({ actor, events }) => {
        ctx.logger.debug.log("Actor %O", actor);
        ctx.logger.debug.log("Actor events %O", events);
        return pipe(
          toActorIO({ ...actor, events: events.map((e) => e.id) as any }),
          TE.fromEither
        );
      }),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      }))
    );
  });
};
