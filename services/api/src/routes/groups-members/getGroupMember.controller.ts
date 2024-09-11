import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { GroupMemberIO } from "./groupMember.io.js";
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
  });
};
