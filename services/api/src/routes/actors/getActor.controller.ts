import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetActorRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Actor.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ActorEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: [
            "memberIn",
            "nationalities",
            "relationsAsSource",
            "relationsAsTarget",
          ],
        },
      }),
      TE.chain((actor) => {
        ctx.logger.debug.log("Actor %O", actor);
        return pipe(ActorIO.decodeSingle(actor), TE.fromEither);
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
