import * as endpoints from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { ProjectEntity } from "@entities/Project.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";

export const MakeEditProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Project.Edit, ({ params: { id }, body }) => {
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
          images.map(({ kind, location, description }) => {
            return {
              id: uuid(),
              kind,
              image: {
                id: uuid(),
                location,
                description,
              },
            };
          })
        )
      ),
    });
    ctx.logger.debug.log("Project Data %O", projectData);
    return pipe(
      ctx.db.save(ProjectEntity, [{ id, ...projectData }]),
      TE.chain(() =>
        ctx.db.findOneOrFail(ProjectEntity, {
          where: { id },
          loadRelationIds: true,
        })
      ),
      TE.map(({ body, ...Group }) => ({
        body: {
          data: {
            ...Group,
            body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
