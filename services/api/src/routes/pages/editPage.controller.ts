import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { NotFoundError } from "@io/ControllerError";

export const MakeEditPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.update(PageEntity, id, body),
      TE.chain(() => ctx.db.findOne(PageEntity, { where: { id } })),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      // TE.chain((page) =>
      //   sequenceS(TE.taskEither)({
      //     page: TE.right(page),
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
