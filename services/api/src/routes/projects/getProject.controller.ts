import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetProjectRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Project.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ProjectEntity, {
        where: { id: Equal(id) },
        relations: ["media", "areas"],
        // loadRelationIds: true,
      }),
      TE.chainEitherK(toProjectIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
