import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { UserIO } from "./user.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeUserListRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.User.List,
    ({ query: { ids: id, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query, id },
        ctx.env.DEFAULT_PAGE_SIZE,
      );
      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            ctx.db.find(UserEntity, { ...findOptions }),
            TE.chainEitherK(UserIO.decodeMany),
          ),
          total: ctx.db.count(UserEntity),
        }),
        TE.map(({ data, total }) => ({
          body: { data, total },
          statusCode: 200,
        })),
      );
    },
  );
};
