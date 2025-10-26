import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreateProjectRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Project.Create,
    ({ body: { endDate, media: _media, ...body } }) => {
      const optionalData = foldOptionals({ endDate });
      return pipe(
        ctx.db.save(ProjectEntity, [
          { ...body, ...optionalData, areas: [...body.areas] },
        ]),
        TE.chain(([project]) => TE.right({ project })),
        TE.chain(({ project: page }) =>
          ctx.db.findOneOrFail(ProjectEntity, {
            where: { id: Equal(page.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK((page) =>
          toProjectIO({
            ...page,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
          }),
        ),
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
