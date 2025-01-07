import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import * as passwordUtils from "@liexp/backend/lib/utils/password.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  AdminCreate,
  UserStatusApproved,
} from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { UserIO } from "./user.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeUserCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.value])(ctx))(
    Endpoints.User.Create,
    ({ body: { password, ...userData } }) => {
      ctx.logger.debug.log("Creating new user %O", userData);
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
        TE.chainEitherK(([user]) => UserIO.decodeSingle(user)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
