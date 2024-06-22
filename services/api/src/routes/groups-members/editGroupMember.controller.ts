import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toGroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditGroupMemberRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.GroupMember.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Edit group member %s with %O", id, body);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const updateData = foldOptionals(body as any);
      return pipe(
        ctx.db.update(GroupMemberEntity, id, updateData),
        TE.chain(() =>
          ctx.db.findOneOrFail(GroupMemberEntity, {
            where: { id: Equal(id) },
            relations: ["actor", "group"],
          }),
        ),
        TE.chainEitherK(toGroupMemberIO),
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
