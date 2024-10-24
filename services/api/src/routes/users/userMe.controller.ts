import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { UserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { toNotAuthorizedError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeUserGetMeRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([])(ctx))(
    Endpoints.User.Custom.GetUserMe,
    (_, req) => {
      ctx.logger.debug.log("Get user me %s", req.user?.id);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(u.id) } }),
        ),
        TE.mapLeft(() => toNotAuthorizedError()),
        TE.chainEitherK(UserIO.decodeSingle),
        TE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        })),
      );
    },
  );
};
