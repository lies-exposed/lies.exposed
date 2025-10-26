import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import * as passwordUtils from "@liexp/backend/lib/utils/password.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { UserStatusPending } from "@liexp/shared/lib/io/http/User.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { UserIO } from "./user.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeSignUpUserRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.User.Custom.SignUpUser,
    ({ body: { password, ...userData } }) => {
      ctx.logger.debug.log("Sign Up user with username or email %O", userData);
      return pipe(
        passwordUtils.hash(password),
        TE.chain((pw) =>
          ctx.db.save(UserEntity, [
            {
              id: uuid(),
              ...userData,
              permissions: [
                http.Auth.Permissions.EventSuggestionCreate.literals[0],
                http.Auth.Permissions.EventSuggestionEdit.literals[0],
              ],
              status: UserStatusPending.literals[0],
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
