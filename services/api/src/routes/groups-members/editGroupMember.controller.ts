import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { GroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditGroupMemberRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
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
