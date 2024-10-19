import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toSettingIO } from "./setting.io.js";
import { SettingEntity } from "#entities/Setting.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeSettingListRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Setting.List,
    ({ query: { id, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query, id },
        ctx.env.DEFAULT_PAGE_SIZE,
      );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            ctx.db.find(SettingEntity, { ...findOptions }),
            TE.chainEitherK(A.traverse(E.Applicative)(toSettingIO)),
          ),
          total: ctx.db.count(SettingEntity),
        }),
        TE.map(({ data, total }) => ({
          body: { data, total },
          statusCode: 200,
        })),
      );
    },
  );
};
