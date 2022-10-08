import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import { RouteContext } from "../route.types";
import { toGroupMemberIO } from "./groupMember.io";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { authenticationHandler } from "@utils/authenticationHandler";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeEditGroupMemberRoute = (
  r: Router,
  ctx: RouteContext
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
          })
        ),
        TE.chainEitherK(toGroupMemberIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
