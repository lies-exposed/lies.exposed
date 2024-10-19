import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { UserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { getORMOptions } from "#utils/orm.utils.js";

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
