import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { ArticleEntity } from "@entities/Article.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { toArticleIO } from "./article.io";

export const MakeListArticlesRoute: Route = (r, { env, db }) => {
  AddEndpoint(r)(endpoints.Article.ListArticles, ({ query }) => {
    const findOptions = getORMOptions(query, env.DEFAULT_PAGE_SIZE);
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          db.find(ArticleEntity, {
            ...findOptions,
            where: {
              ...findOptions.where,
              draft: false,
            },
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
