import { endpoints } from "@econnessione/shared";
import { ServerError } from "@io/ControllerError";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ActorEntity } from "./actor.entity";

export const MakeDeleteActorRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.Actor.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(ActorEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainFirst(() =>
        sequenceS(TE.taskEither)({
          avatar: pipe(
            s3.deleteObject({
              Bucket: env.SPACE_BUCKET,
              Key: `/actors/${id}.jpg`,
            }),
            TE.mapLeft((e) => ServerError())
          ),
          actor: db.delete(ActorEntity, id),
        })
      ),
      TE.map((page) => ({
        body: {
          data: {
            ...page,
            type: "ActorFrontmatter" as const,
            groups: (page.groups as any) as string[],
          },
        },
        statusCode: 200,
      }))
    );
  });
};
