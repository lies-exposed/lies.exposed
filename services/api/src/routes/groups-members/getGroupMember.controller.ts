import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { RouteContext } from "../route.types";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { toGroupMemberIO } from "./groupMember.io";

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
      }))
    );
  });
};
