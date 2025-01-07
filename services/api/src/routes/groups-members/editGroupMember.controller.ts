import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditGroupMemberRoute: Route = (r, ctx): void => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.GroupMember.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Edit group member %s with %O", id, body);

      const updateData = foldOptionals(body as any);
      return pipe(
        ctx.db.update(GroupMemberEntity, id, updateData),
        TE.chain(() =>
          ctx.db.findOneOrFail(GroupMemberEntity, {
            where: { id: Equal(id) },
            relations: ["actor", "group"],
          }),
        ),
        TE.chainEitherK((gm) =>
          GroupMemberIO.decodeSingle(gm, ctx.env.SPACE_ENDPOINT),
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
