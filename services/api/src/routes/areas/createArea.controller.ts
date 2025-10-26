import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreateAreaRoute: Route = (r, { db, logger, s3: _s3, jwt }) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])({ logger, jwt }))(
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
        TE.chainEitherK((a) => AreaIO.decodeSingle(a)),
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
