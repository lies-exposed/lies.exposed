import { endpoints } from "@econnessione/shared";
import { NotFoundError } from "@io/ControllerError";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { GroupEntity } from "./group.entity";

export const MakeGetGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Group.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOne(GroupEntity, { where: { id }, loadRelationIds: true }),
      TE.chain(TE.fromOption(() => NotFoundError("Group"))),
      TE.chain((GroupEntity) =>
        sequenceS(TE.taskEither)({
          Group: TE.right(GroupEntity),
          // body: ctx.mdx.readFile(`/Groups/${GroupEntity.uuid}.md`),
        })
      ),
      TE.map(({ Group }) => ({
        body: {
          data: {
            ...Group,
            type: "GroupFrontmatter" as const,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
