import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { UserStatusApproved } from "@liexp/shared/lib/io/http/User";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import * as passwordUtils from "@utils/password.utils";

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
