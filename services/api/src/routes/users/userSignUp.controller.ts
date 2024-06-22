import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UserStatusPending } from "@liexp/shared/lib/io/http/User.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as TE from "fp-ts/TaskEither";
import { toUserIO } from "./user.io.js";
import { UserEntity } from "#entities/User.entity.js";
import { type Route } from "#routes/route.types.js";
import * as passwordUtils from "#utils/password.utils.js";

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
                http.User.EventSuggestionCreate.value,
                http.User.EventSuggestionEdit.value,
              ],
              status: UserStatusPending.value,
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
