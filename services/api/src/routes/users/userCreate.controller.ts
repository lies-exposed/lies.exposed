import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UserStatusApproved } from "@liexp/shared/lib/io/http/User.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as TE from "fp-ts/TaskEither";
import { toUserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import * as passwordUtils from "#utils/password.utils.js";

export const MakeUserCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.User.Create,
    ({ body: { password, ...userData } }) => {
      ctx.logger.debug.log("Login user with username or email %O", userData);
      return pipe(
        passwordUtils.hash(password),
        TE.chain((pw) =>
          ctx.db.save(UserEntity, [
            {
              id: uuid(),
              ...userData,
              status: UserStatusApproved.value,
              passwordHash: pw,
            },
          ]),
        ),
        TE.chainEitherK(([user]) => toUserIO(user)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
