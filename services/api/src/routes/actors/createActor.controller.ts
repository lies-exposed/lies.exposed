import { endpoints } from "@econnessione/shared";
import { ServerError } from "@io/ControllerError";
import { getBufferFromBase64 } from "@utils/base64.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ActorEntity } from "./actor.entity";

export const MakeCreateActorRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.Actor.Create, ({ body: { avatar, ...body } }) => {
    return pipe(
      db.save(ActorEntity, [body]),
      TE.chain(([actor]) =>
        sequenceS(TE.taskEither)({
          page: TE.right(actor),
          avatar: pipe(
            s3.upload({
              Bucket: env.SPACE_BUCKET,
              Key: `actors/${actor.id}.jpg`,
              Body: getBufferFromBase64(avatar.src, 'image'),
              ACL: 'public-read',
              ContentType: 'image/jpeg'
            }),
            TE.mapLeft((e) => ServerError())
          ),
        })
      ),
      TE.chainFirst(({ page, avatar }) =>
        db.update(ActorEntity, page.id, { avatar: avatar.Location })
      ),
      TE.chain(({ page }) =>
        db.findOneOrFail(ActorEntity, {
          where: { id: page.id },
          loadRelationIds: true,
        })
      ),
      TE.map((page) => ({
        body: {
          data: {
            ...page,
            type: "ActorFrontmatter" as const,
            groups: page.groups as any as string[],
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
