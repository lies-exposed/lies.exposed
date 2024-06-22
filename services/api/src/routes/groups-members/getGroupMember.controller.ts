import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toGroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";

export const MakeGetGroupMemberRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.GroupMember.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(GroupMemberEntity, {
        where: { id: Equal(id) },
        relations: ["actor", "group"],
        loadRelationIds: {
          relations: [],
        },
      }),
      TE.chainEitherK(toGroupMemberIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
