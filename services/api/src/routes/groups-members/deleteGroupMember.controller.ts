import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

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
        TE.chainEitherK((g) =>
          GroupMemberIO.decodeSingle(g, ctx.env.SPACE_ENDPOINT),
        ),
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
