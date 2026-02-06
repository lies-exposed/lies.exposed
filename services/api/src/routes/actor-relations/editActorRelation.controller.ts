import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { ActorRelationIO } from "@liexp/backend/lib/io/actorRelation.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditActorRelationRoute: Route = (r, ctx): void => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.ActorRelation.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Edit actor relation %s with %O", id, body);

      const updateData = foldOptionals(body);
      const { actor, relatedActor, ...rest } = updateData;
      return pipe(
        ctx.db.update(ActorRelationEntity, id, {
          ...rest,
          ...(actor ? { actor: { id: actor } } : {}),
          ...(relatedActor ? { relatedActor: { id: relatedActor } } : {}),
        }),
        TE.chain(() =>
          ctx.db.findOneOrFail(ActorRelationEntity, {
            where: { id: Equal(id) },
            relations: ["actor", "relatedActor"],
          }),
        ),
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
