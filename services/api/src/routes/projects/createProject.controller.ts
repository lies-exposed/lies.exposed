import { endpoints } from "@econnessione/shared";
import { ProjectEntity } from "@entities/Project.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";

export const MakeCreateProjectRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.Project.Create, ({ body: { endDate, ...body } }) => {
    const optionalData = foldOptionals({ endDate });
    return pipe(
      db.save(ProjectEntity, [{ ...body, ...optionalData }]),
      TE.chain(([actor]) =>
        sequenceS(TE.taskEither)({
          page: TE.right(actor),
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
      TE.chain(({ page }) =>
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
  });
};
