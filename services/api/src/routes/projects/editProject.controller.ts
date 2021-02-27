import * as endpoints from "@econnessione/shared/endpoints";
import { ProjectEntity } from "@entities/Project.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { uuid } from "@utils/uuid.utils";
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
            // const area = new AreaEntity();
            // area.id = uuid();
            // area.geometry = a.polygon;
            // area.color = a.color;
            // area.label = a.label;
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
          images.map((i) => {
            return {
              id: uuid(),
              ...i,
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
