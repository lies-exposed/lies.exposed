import { endpoints } from "@econnessione/shared";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ActorEntity } from "./actor.entity";
import { toActorIO } from "./actor.io";

export const MakeCreateActorRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(endpoints.Actor.Create, ({ body, headers }) => {
    logger.debug.log("Headers %O", { headers, body });

    return pipe(
      db.save(ActorEntity, [body]),
      TE.chain(([page]) =>
        db.findOneOrFail(ActorEntity, {
          where: { id: page.id },
          loadRelationIds: true,
        })
      ),
      TE.chainEitherK(toActorIO),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 201,
      }))
    );
  });
};
