import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { UserEntity } from "@entities/User.entity";
import { RouteContext } from "@routes/route.types";
import * as passwordUtils from "@utils/password.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toUserIO } from "./user.io";

export const MakeUserCreateRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
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
              passwordHash: pw,
            },
          ])
        ),
        TE.chainEitherK(([user]) => toUserIO(user)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
