import { endpoints, utils } from "@econnessione/shared";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ArticleEntity } from "./article.entity";

export const MakeListArticlesRoute: Route = (r, { env, db }) => {
  AddEndpoint(r)(endpoints.Article.ListArticles, ({ query }) => {
    // console.log('here')
    return pipe(
      sequenceS(TE.taskEither)({
        data: db.find(ArticleEntity, {
          ...utils.getORMOptions(query, env.DEFAULT_PAGE_SIZE),
        }),
        total: db.count(ArticleEntity),
      }),
      TE.map(({ data, total }) => ({
        body: {
          data: data.map((page) => ({
            ...page,
            type: "Article" as const,
          })),
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
