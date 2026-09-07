import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { ActorRelationIO } from "@liexp/backend/lib/io/actorRelation.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetActorRelationRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.ActorRelation.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ActorRelationEntity, {
        where: { id: Equal(id) },
        relations: ["actor", "relatedActor"],
        loadRelationIds: {
          relations: [],
        },
      }),
      TE.chainEitherK(ActorRelationIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
