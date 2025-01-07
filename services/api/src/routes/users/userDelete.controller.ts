import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { UserIO } from "./user.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeUserDeleteRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.User.Delete,
    ({ params: { id } }) => {
      ctx.logger.debug.log("Delete user %s ", id);
      return pipe(
        ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(id) } }),
        TE.tap((u) => ctx.db.softDelete(UserEntity, u.id)),
        TE.chainEitherK((user) => UserIO.decodeSingle(user)),
        TE.map(() => ({
          body: undefined,
          statusCode: 200,
        })),
      );
    },
  );
};
