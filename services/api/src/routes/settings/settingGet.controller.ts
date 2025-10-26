import { SettingEntity } from "@liexp/backend/lib/entities/Setting.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toSettingIO } from "./setting.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeSettingGetRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Setting.Get,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(SettingEntity, { where: { id: Equal(id) } }),
        TE.chainEitherK(toSettingIO),
        TE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        })),
      );
    },
  );
};
