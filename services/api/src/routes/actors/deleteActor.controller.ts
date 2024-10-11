import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { ActorIO } from "./actor.io.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteActorRoute: Route = (r, { db, env, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])({ logger, jwt }))(
    Endpoints.Actor.Delete,
    ({ params: { id } }) => {
      return pipe(
        db.findOneOrFail(ActorEntity, {
          where: { id: Equal(id) },
        }),
        TE.chainFirst(() =>
          sequenceS(TE.ApplicativeSeq)({
            // avatar: pipe(
            //   s3.deleteObject({
            //     Bucket: env.SPACE_BUCKET,
            //     Key: `public/actors/${id}/${id}.jpg`,
            //   }),
            //   TE.mapLeft((e) => ServerError())
            // ),
            actor: db.softDelete(ActorEntity, id),
          }),
        ),
        TE.chainEitherK((a) => ActorIO.decodeSingle(a, env.SPACE_ENDPOINT)),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
