import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toSettingIO } from "./setting.io.js";
import { SettingEntity } from "#entities/Setting.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeSettingEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.Setting.Edit,
    ({ params: { id }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit setting %s  with %O", id, userData);
      return pipe(
        ctx.db.findOneOrFail(SettingEntity, { where: { id: Equal(id) } }),
        TE.chain((u) =>
          ctx.db.save(SettingEntity, [
            {
              ...u,
              ...userData,
            },
          ]),
        ),
        TE.chainEitherK(([user]) => toSettingIO(user)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
