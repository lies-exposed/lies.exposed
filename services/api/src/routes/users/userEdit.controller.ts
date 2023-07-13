import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toUserIO } from "./user.io";
import { UserEntity } from "@entities/User.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeUserEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.User.Edit,
    ({ params: { id }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit user %s  with %O", id, userData);
      return pipe(
        ctx.db.findOneOrFail(UserEntity, { where: { id: Equal(id) } }),
        TE.chain((u) =>
          ctx.db.save(UserEntity, [
            {
              ...u,
              ...userData,
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
