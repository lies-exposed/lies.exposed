import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeDeleteActorRoute: Route = (
  r,
  { s3, db, env, logger, jwt }
) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:delete"]))(
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
    }
  );
};
