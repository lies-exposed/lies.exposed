import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toSettingIO } from "./setting.io.js";
import { SettingEntity } from "#entities/Setting.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeSettingCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
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
