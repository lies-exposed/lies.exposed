import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "routes/route.types";

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
