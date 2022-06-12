import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from 'typeorm';
import { ActorEntity } from "../../entities/Actor.entity";
import { Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { ServerError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateActorRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r, authenticationHandler(logger))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.findOne(ActorEntity, { where: { username: body.username } }),
        TE.filterOrElse(O.isNone, () => ServerError()),
        TE.chain(() => db.save(ActorEntity, [body])),
        TE.chain(([actor]) =>
          db.findOneOrFail(ActorEntity, {
            where: { id: Equal( actor.id) },
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
    }
  );
};
