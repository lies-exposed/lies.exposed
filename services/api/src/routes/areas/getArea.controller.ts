import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AreaIO } from "./Area.io.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetAreaRoute: Route = (r, { db, env, ...ctx }) => {
  AddEndpoint(r)(Endpoints.Area.Get, ({ params: { id } }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(ctx)(req, []),
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
      TE.chainEitherK((a) => AreaIO.decodeSingle(a, env.SPACE_ENDPOINT)),
      TE.map((area) => ({
        body: {
          data: area,
        },
        statusCode: 200,
      })),
    );
  });
};
