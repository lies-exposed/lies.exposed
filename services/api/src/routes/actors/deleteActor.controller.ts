import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";

export const MakeDeleteActorRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Actor.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(ActorEntity, {
        where: { id },
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
  });
};
