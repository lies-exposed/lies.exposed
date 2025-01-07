import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { createActor } from "#flows/actors/createActor.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.value])(ctx))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      ctx.logger.debug.log("Headers %O", { headers, body });

      return pipe(
        createActor(body)(ctx),
        TE.chain((actor) =>
          ctx.db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.id) },
          }),
        ),
        TE.chainEitherK((a) => ActorIO.decodeSingle(a, ctx.env.SPACE_ENDPOINT)),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
