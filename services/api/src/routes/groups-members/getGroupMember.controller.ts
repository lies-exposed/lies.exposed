import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetGroupMemberRoute: Route = (r, ctx) => {
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
