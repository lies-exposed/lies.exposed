import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PageEntity } from "../../entities/Page.entity";
import { NotFoundError } from "@io/ControllerError";
import { RouteContext } from "routes/route.types";

export const MakeEditPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.update(PageEntity, id, body),
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
