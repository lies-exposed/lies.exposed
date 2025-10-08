import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetAreaRoute: Route = (
  r,
  { db, env: _env, s3: _s3, ...ctx },
) => {
  AddEndpoint(r)(Endpoints.Area.Get, ({ params: { id } }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(req, [])(ctx),
      fp.TE.fromIO,
      fp.TE.chain((user) =>
        db.findOneOrFail(AreaEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["media", "events"],
          },
          relations: {
            featuredImage: true,
          },
          withDeleted: user ? checkIsAdmin(user.permissions) : false,
        }),
      ),
      TE.chainEitherK((a) => AreaIO.decodeSingle(a)),
      TE.map((area) => ({
        body: {
          data: area,
        },
        statusCode: 200,
      })),
    );
  });
};
