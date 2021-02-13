import { endpoints } from "@econnessione/shared";
import { ImageEntity } from "@entities/Image.entity";
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
  AddEndpoint(r)(
    endpoints.Project.Edit,
    ({ params: { id }, body: { ...body } }) => {
      const projectData = foldOptionals({
        ...body,
        images: pipe(
          body.images,
          O.map((images) =>
            images.map((i) => {
              const image = new ImageEntity();
              image.id = O.getOrElse(() => uuid())(i.id);
              image.location = i.location;
              image.description = O.toNullable(i.description);
              return image;
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
    }
  );
};
