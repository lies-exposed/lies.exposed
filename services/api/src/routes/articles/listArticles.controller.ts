import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Route } from "../route.types";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { getORMOptions } from "@utils/orm.utils";

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
