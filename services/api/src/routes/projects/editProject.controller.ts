import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { uuid } from "@liexp/shared/utils/uuid";
import { Router } from "express";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ProjectEntity } from "@entities/Project.entity";
import { Equal } from "typeorm";
import { authenticationHandler } from "@utils/authenticationHandler";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { RouteContext } from "../route.types";
import { toProjectIO } from "./project.io";

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
            })
          )
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
            })
          )
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
          })
        ),
        TE.chain((p) => TE.fromEither(toProjectIO(p))),
        TE.map((project) => ({
          body: {
            data: project,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
