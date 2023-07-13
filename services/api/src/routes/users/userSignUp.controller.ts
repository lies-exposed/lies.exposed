import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as http from "@liexp/shared/lib/io/http";
import { UserStatusPending } from "@liexp/shared/lib/io/http/User";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { type Route } from "@routes/route.types";
import * as passwordUtils from "@utils/password.utils";

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
