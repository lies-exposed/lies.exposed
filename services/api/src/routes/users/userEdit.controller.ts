import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { UserIO } from "./user.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeUserEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.User.Edit,
    ({ params: { id }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit user %s  with %O", id, userData);
      return pipe(
        ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(id) } }),
        TE.chain((u) =>
          ctx.db.save(UserEntity, [
            {
              ...u,
              ...userData,
              permissions: [...userData.permissions],
            },
          ]),
        ),
        TE.chainEitherK(([user]) => UserIO.decodeSingle(user)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
