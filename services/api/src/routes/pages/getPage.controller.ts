import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { PageEntity } from "../../entities/Page.entity";
import { Route } from "../route.types";
import { NotFoundError } from "@io/ControllerError";

export const MakeGetPageRoute: Route = (r, ctx) => {
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
