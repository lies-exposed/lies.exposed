import { endpoints } from "@econnessione/shared";
import { ServerError } from "@io/ControllerError";
import { getBufferFromBase64 } from "@utils/base64.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { GroupEntity } from "../../entities/Group.entity";

export const MakeCreateGroupRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.Group.Create, ({ body: { avatar, color, ...body }}) => {
    return pipe(
      db.save(GroupEntity, [{...body, color: color.replace('#', '')}]),
      TE.chain(([actor]) =>
        sequenceS(TE.taskEither)({
          page: TE.right(actor),
          avatar: pipe(
            s3.upload({
              Bucket: env.SPACE_BUCKET,
              Key: `groups/${actor.id}.jpg`,
              Body: getBufferFromBase64(avatar.src, "image"),
              ACL: "public-read",
              ContentType: "image/jpeg",
            }),
            TE.mapLeft((e) => ServerError())
          ),
        })
      ),
      TE.chainFirst(({ page, avatar }) =>
        db.update(GroupEntity, page.id, { avatar: avatar.Location })
      ),
      TE.chain(({ page }) =>
        db.findOneOrFail(GroupEntity, {
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
