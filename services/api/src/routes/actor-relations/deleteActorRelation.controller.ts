import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { ActorRelationIO } from "@liexp/backend/lib/io/actorRelation.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeDeleteActorRelationRoute: Route = (r, ctx): void => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.ActorRelation.Delete,
    ({ params: { id } }) => {
      ctx.logger.debug.log("Delete actor relation %s", id);

      return pipe(
        ctx.db.findOneOrFail(ActorRelationEntity, {
          where: { id: Equal(id) },
          relations: ["actor", "relatedActor"],
        }),
        TE.chainFirst(() => ctx.db.softDelete(ActorRelationEntity, id)),
        TE.chainEitherK((ar) => ActorRelationIO.decodeSingle(ar)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
