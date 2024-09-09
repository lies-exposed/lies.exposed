import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { ProjectEntity } from "#entities/Project.entity.js";
import { ProjectImageEntity } from "#entities/ProjectImage.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeCreateProjectRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Project.Create,
    ({ body: { endDate, media, ...body } }) => {
      const optionalData = foldOptionals({ endDate });
      return pipe(
        db.save(ProjectEntity, [{ ...body, ...optionalData }]),
        TE.chain(([project]) =>
          sequenceS(TE.taskEither)({
            project: TE.right(project),
            projectImages: db.save(
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
          db.findOneOrFail(ProjectEntity, {
            where: { id: Equal(page.id) },
            loadRelationIds: true,
          }),
        ),
        TE.map((page) => ({
          body: {
            data: {
              ...page,
              type: "GroupEntity" as const,
              // members: (page.members as any) as string[],
              // subGroups: (page.subGroups as any) as string[],
              createdAt: page.createdAt.toISOString(),
              updatedAt: page.updatedAt.toISOString(),
              // body,
            },
          },
          statusCode: 200,
        })),
      );
    },
  );
};
