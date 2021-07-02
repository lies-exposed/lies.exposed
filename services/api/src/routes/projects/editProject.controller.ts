import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { ProjectEntity } from "@entities/Project.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toProjectIO } from "./project.io";

export const MakeEditProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Project.Edit, ({ params: { id }, body }) => {
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
      images: pipe(
        body.images,
        O.map((images) =>
          images.map(({ kind, ...image }) => {
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
        where: { id },
        relations: ["images", "areas"],
      }),
      TE.chain(() => ctx.db.save(ProjectEntity, [{ id, ...projectData }])),
      TE.chain(() =>
        ctx.db.findOneOrFail(ProjectEntity, {
          where: { id },
          relations: ["images", "areas"],
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
  });
};
