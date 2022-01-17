import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "../route.types";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListArticlesRoute: Route = (r, { env, db, logger }) => {
  AddEndpoint(r)(
    Endpoints.Article.List,
    ({ query: { draft: _draft, ...query } }) => {
      const findOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);
      const draft = pipe(
        _draft,
        O.map((d) => ({ draft: d })),
        O.getOrElse(() => ({}))
      );
      return pipe(
        sequenceS(TE.taskEither)({
          data: pipe(
            db.find(ArticleEntity, {
              ...findOptions,
              where: {
                ...findOptions.where,
                ...draft,
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
    }
  );
};
