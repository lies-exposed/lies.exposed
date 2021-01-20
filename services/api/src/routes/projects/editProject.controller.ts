import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ProjectEntity } from "./project.entity";

export const MakeEditProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Project.Edit, ({ params: { id }, body: { avatar, ...body } }) => {
    return pipe(
      ctx.db.update(ProjectEntity, id, body),
      TE.chain(() => ctx.db.findOneOrFail(ProjectEntity, { where: { id } })),
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
