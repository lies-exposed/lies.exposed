import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "../route.types";
import { ArticleEntity } from "@entities/Article.entity";

export const MakeGetArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Article.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ArticleEntity, { where: { path: id } }),
      TE.map((article) => ({
        body: {
          data: {
            ...article,
            type: "Article",
          },
        },
        statusCode: 200,
      }))
    );
  });
};
