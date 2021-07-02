import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { NotFoundError } from "@io/ControllerError";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { PageEntity } from "../../entities/Page.entity";

export const MakeGetPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOne(PageEntity, { where: { id } }),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      TE.chain((pageEntity) =>
        sequenceS(TE.taskEither)({
          page: TE.right(pageEntity),
          // body: ctx.mdx.readFile(`/pages/${pageEntity.uuid}.md`),
        })
      ),
      TE.map(({ page }) => ({
        body: {
          data: {
            ...page,
            type: "PageFrontmatter" as const,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
