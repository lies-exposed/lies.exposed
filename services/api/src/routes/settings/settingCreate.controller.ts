import { SettingEntity } from "@liexp/backend/lib/entities/Setting.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toSettingIO } from "./setting.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeSettingCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Setting.Create,
    ({ body: { id, value } }) => {
      ctx.logger.debug.log("Create setting key %s => %O", id, value);
      return pipe(
        ctx.db.save(SettingEntity, [{ id, value }]),
        TE.chain(() => ctx.db.findOneOrFail(SettingEntity, { where: { id } })),
        TE.chainEitherK(toSettingIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
