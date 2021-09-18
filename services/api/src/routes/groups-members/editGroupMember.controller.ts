import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toGroupMemberIO } from "./groupMember.io";

export const MakeEditGroupMemberRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(Endpoints.GroupMember.Edit, ({ params: { id }, body }) => {
    ctx.logger.debug.log("Edit group member %s with %O", id, body);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const updateData = foldOptionals(body as any);
    return pipe(
      ctx.db.update(GroupMemberEntity, id, updateData),
      TE.chain(() =>
        ctx.db.findOneOrFail(GroupMemberEntity, {
          where: { id },
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
  });
};
