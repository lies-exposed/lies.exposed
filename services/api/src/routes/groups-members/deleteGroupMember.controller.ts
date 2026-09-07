import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeDeleteGroupMemberRoute: Route = (r, ctx): void => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.GroupMember.Delete,
    ({ params: { id } }) => {
      ctx.logger.debug.log("Delete group member %s", id);

      return pipe(
        ctx.db.findOneOrFail(GroupMemberEntity, {
          where: { id: Equal(id) },
          relations: ["actor", "group"],
        }),
        TE.chainFirst(() => ctx.db.softDelete(GroupMemberEntity, id)),
        TE.chainEitherK((g) => GroupMemberIO.decodeSingle(g)),
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
