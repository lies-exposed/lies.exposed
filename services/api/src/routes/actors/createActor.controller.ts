import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { ServerError } from "@io/ControllerError";
import { ActorEntity } from "../../entities/Actor.entity";
import { authenticationHandler } from "@utils/authenticationHandler";
import { Route } from "../route.types";
import { toActorIO } from "./actor.io";

export const MakeCreateActorRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.findOne(ActorEntity, { where: { username: body.username } }),
        TE.filterOrElse(O.isNone, () => ServerError()),
        TE.chain(() => db.save(ActorEntity, [body])),
        TE.chain(([actor]) =>
          db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.id) },
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
