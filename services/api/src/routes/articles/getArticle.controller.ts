import { endpoints } from "@econnessione/shared";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ArticleEntity } from "./article.entity";

export const MakeGetArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(endpoints.Article.Get, ({ params: { id }}) => {
    // console.log('here')
    return pipe(
      ctx.db.findOneOrFail(ArticleEntity, { where: { id }}),
      TE.map((article) => ({
        body: {
          data: {
            ...article,
            type: 'Article'
          },
        },
        statusCode: 200,
      }))
    );
  });
};
