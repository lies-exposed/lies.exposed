import * as endpoints from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";


export const MakeCreateProjectRoute: Route = (r, { db, env }) => {
  AddEndpoint(r)(
    endpoints.Project.Create,
    ({ body: { endDate, images, ...body } }) => {
      const optionalData = foldOptionals({ endDate });
      return pipe(
        db.save(ProjectEntity, [{ ...body, ...optionalData }]),
        TE.chain(([project]) =>
          sequenceS(TE.taskEither)({
            project: TE.right(project),
            projectImages: db.save(
              ProjectImageEntity,
              images.map((i) => ({
                image: {
                  id: uuid(),
                  location: i.location,
                  description: i.description,
                },
                kind: i.kind,
                project: project,
              }))
            ),
            // avatar: pipe(
            //   s3.upload({
            //     Bucket: env.SPACE_BUCKET,
            //     Key: `groups/${actor.id}.jpg`,
            //     Body: getBufferFromBase64(avatar.src, "image"),
            //     ACL: "public-read",
            //     ContentType: "image/jpeg",
            //   }),
            //   TE.mapLeft((e) => ServerError())
            // ),
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
