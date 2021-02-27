import * as endpoints from "@econnessione/shared/endpoints";
import { AreaEntity } from "@entities/Area.entity";
import { ServerError } from "@io/ControllerError";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toAreaIO } from "./Area.io";

export const MakeDeleteAreaRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.Area.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
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
          actor: db.delete(AreaEntity, id),
        })
      ),
      TE.chainEitherK(toAreaIO),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      }))
    );
  });
};
