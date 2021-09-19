import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";
import { ServerError } from "@io/ControllerError";
import { Route } from "routes/route.types";

export const MakeDeleteActorRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Actor.Delete, ({ params: { id } }) => {
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
      TE.chainEitherK(toActorIO),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      }))
    );
  });
};
