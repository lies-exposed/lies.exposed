import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { AreaEntity } from "../../entities/Area.entity";
import { Route } from "../route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { toAreaIO } from "./Area.io";

export const MakeCreateAreaRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Area.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.save(AreaEntity, [body]),
        TE.chain(([actor]) =>
          db.findOneOrFail(AreaEntity, {
            where: { id: Equal(actor.id) },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toAreaIO),
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
