import { endpoints } from "@econnessione/shared";
import { ArticleEntity } from "@entities/Article.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toArticleIO } from "./article.io";

export const MakeListArticlesRoute: Route = (r, { env, db }) => {
  AddEndpoint(r)(endpoints.Article.ListArticles, ({ query }) => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          db.find(ArticleEntity, {
            ...getORMOptions(query, env.DEFAULT_PAGE_SIZE),
          }),
          TE.chainEitherK(A.traverse(E.either)(toArticleIO))
        ),
        total: db.count(ArticleEntity),
      }),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
