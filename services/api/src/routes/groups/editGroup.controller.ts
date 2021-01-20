import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { GroupEntity } from "./group.entity";

export const MakeEditGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Group.Edit, ({ params: { id }, body: { avatar, ...body } }) => {
    return pipe(
      ctx.db.update(GroupEntity, id, body),
      TE.chain(() => ctx.db.findOneOrFail(GroupEntity, { where: { id } })),
      // TE.chain((Group) =>
      //   sequenceS(TE.taskEither)({
      //     Group: TE.right(Group),
      //     body: ctx.mdx.readFile(`/Groups/${(Group).uuid}.md`),
      //   })
      // ),
      TE.map(({ body, ...Group }) => ({
        body: {
          data: {
            ...Group,
            body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
