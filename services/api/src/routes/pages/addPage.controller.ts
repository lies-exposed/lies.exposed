import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { PageEntity } from "../../entities/Page.entity";

export const MakeAddPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.Create, ({ body }) => {
    return pipe(
      ctx.db.save(PageEntity, [body]),
      TE.chain(([page]) =>
        sequenceS(TE.taskEither)({
          page: TE.right(page),
          // body: ctx.mdx.writeFile(`/pages/${page.id}.md`, body.body),
        })
      ),
      TE.map(({ page }) => ({
        body: {
          data: {
            ...page,
            // body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
