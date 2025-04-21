import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { ProjectImageEntity } from "@liexp/backend/lib/entities/ProjectImage.entity.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateProjectRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Project.Create,
    ({ body: { endDate, media, ...body } }) => {
      const optionalData = foldOptionals({ endDate });
      return pipe(
        ctx.db.save(ProjectEntity, [
          { ...body, ...optionalData, areas: [...body.areas] },
        ]),
        TE.chain(([project]) =>
          sequenceS(TE.ApplicativeSeq)({
            project: TE.right(project),
            projectImages: ctx.db.save(
              ProjectImageEntity,
              media.map((i) => ({
                image: {
                  id: uuid(),
                  location: i.location,
                  description: i.description,
                },
                kind: i.kind,
                project,
              })),
            ),
          }),
        ),
        TE.chain(({ project: page }) =>
          ctx.db.findOneOrFail(ProjectEntity, {
            where: { id: Equal(page.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK((page) =>
          toProjectIO({
            ...page,
            // type: "GroupEntity" as const,
            // members: (page.members as any) as string[],
            // subGroups: (page.subGroups as any) as string[],
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            // body,
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
