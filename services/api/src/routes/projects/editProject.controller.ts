import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Router } from "express";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { ProjectEntity } from "#entities/Project.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
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
            media.map(({ kind, ...image }) => {
              return {
                id: uuid(),
                kind,
                image: {
                  id: uuid(),
                  ...image,
                },
                project: { id },
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
