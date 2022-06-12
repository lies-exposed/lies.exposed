import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from 'typeorm';
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { NotFoundError } from "@io/ControllerError";

export const MakeGetPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      TE.chain((pageEntity) =>
        sequenceS(TE.taskEither)({
          page: TE.right(pageEntity),
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
