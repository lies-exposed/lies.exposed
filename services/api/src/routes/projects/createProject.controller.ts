import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { uuid } from "@liexp/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeCreateProjectRoute: Route = (r, { db, env }) => {
  AddEndpoint(r)(
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
                project: project,
              }))
            ),
          })
        ),
        TE.chain(({ project: page }) =>
          db.findOneOrFail(ProjectEntity, {
            where: { id: page.id },
            loadRelationIds: true,
          })
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
        }))
      );
    }
  );
};
