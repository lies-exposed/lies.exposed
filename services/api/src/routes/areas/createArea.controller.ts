import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { AreaEntity } from "../../entities/Area.entity";
import { Route } from "../route.types";
import { toAreaIO } from "./Area.io";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateAreaRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r, authenticationHandler(logger))(
    Endpoints.Area.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.save(AreaEntity, [body]),
        TE.chain(([actor]) =>
          db.findOneOrFail(AreaEntity, {
            where: { id: actor.id },
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
