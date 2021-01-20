import { endpoints } from "@econnessione/shared";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ArticleEntity } from "./article.entity";

export const MakeCreateArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(endpoints.Article.Create, ({ body: {
    avatar,
    ...body
  } }) => {
    return pipe(
      ctx.db.save(ArticleEntity, [body]),
      TE.map(([article]) => ({
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
