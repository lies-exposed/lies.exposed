import { fp } from "@liexp/core/lib/fp";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { AreaEntity } from "../../entities/Area.entity";
import { type Route } from "../route.types";
import { toAreaIO } from "./Area.io";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateAreaRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Area.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.findOne(AreaEntity, {
          where: { slug: Equal(body.slug) },
          loadRelationIds: true,
        }),
        TE.chain((area) => {
          if (fp.O.isSome(area)) {
            return TE.right([area.value]);
          }
          return db.save(AreaEntity, [body]);
        }),
        fp.TE.map(([a]) => a),
        TE.chainEitherK(toAreaIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
