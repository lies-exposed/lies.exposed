import { SettingEntity } from "@liexp/backend/lib/entities/Setting.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toSettingIO } from "./setting.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeSettingDeleteRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Setting.Delete,
    ({ params: { id } }) => {
      ctx.logger.debug.log("Delete user %s ", id);
      return pipe(
        ctx.db.findOneOrFail(SettingEntity, { where: { id: Equal(id) } }),
        TE.tap((u) => ctx.db.softDelete(SettingEntity, u.id)),
        TE.chainEitherK((user) => toSettingIO(user)),
        TE.map(() => ({
          body: undefined,
          statusCode: 200,
        })),
      );
    },
  );
};
