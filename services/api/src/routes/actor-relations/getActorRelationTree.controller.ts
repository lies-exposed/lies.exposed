import { buildActorRelationTree } from "@liexp/backend/lib/flows/actor-relations/buildActorRelationTree.flow.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetActorRelationTreeRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.ActorRelation.Custom.Tree, ({ params: { id } }) => {
    const maxDepth = 3;

    return pipe(
      buildActorRelationTree(id, maxDepth)(ctx),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
