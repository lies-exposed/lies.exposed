import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeDeleteGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Group.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(GroupEntity, { where: { id } }),
        TE.tap(() => ctx.db.softDelete(GroupEntity, id)),
        TE.chainEitherK((data) => GroupIO.decodeSingle(data)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
