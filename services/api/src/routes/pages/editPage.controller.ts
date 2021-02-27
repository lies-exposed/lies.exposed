import * as endpoints from "@econnessione/shared/endpoints";
import { NotFoundError } from "@io/ControllerError";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { PageEntity } from "../../entities/Page.entity";

export const MakeEditPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Page.EditPage, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.update(PageEntity, id,  body),
      TE.chain(() => ctx.db.findOne(PageEntity, { where: { id } })),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      // TE.chain((page) =>
      //   sequenceS(TE.taskEither)({
      //     page: TE.right(page),
      //     body: ctx.mdx.readFile(`/pages/${(page).uuid}.md`),
      //   })
      // ),
      TE.map(({ body, ...page }) => ({
        body: {
          data: {
            ...page,
            body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
