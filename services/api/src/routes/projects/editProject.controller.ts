import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditProjectRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Project.Edit,
    ({ params: { id }, body }) => {
      const projectData = foldOptionals({
        ...body,
        areas: pipe(
          body.areas,
          O.map((areas) =>
            areas.map((a) => {
              return {
                id: uuid(),
                ...a,
              };
            }),
          ),
        ),
        media: pipe(
          body.media,
          O.map((media) =>
            media.map((image) => {
              return {
                id: uuid(),
                ...image,
              };
            }),
          ),
        ),
      });

      ctx.logger.debug.log("Project Data %O", JSON.stringify(projectData));

      return pipe(
        ctx.db.findOneOrFail(ProjectEntity, {
          where: { id: Equal(id) },
          relations: ["media", "areas"],
        }),
        TE.chain(() => ctx.db.save(ProjectEntity, [{ id, ...projectData }])),
        TE.chain(() =>
          ctx.db.findOneOrFail(ProjectEntity, {
            where: { id: Equal(id) },
            relations: ["media", "areas"],
          }),
        ),
        TE.chain((p) => TE.fromEither(toProjectIO(p))),
        TE.map((project) => ({
          body: {
            data: project,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
