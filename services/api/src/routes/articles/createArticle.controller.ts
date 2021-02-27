import * as endpoints from "@econnessione/shared/endpoints";
import { ArticleEntity } from "@entities/Article.entity";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toArticleIO } from "./article.io";

export const MakeCreateArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(endpoints.Article.Create, ({ body: { avatar, ...body } }) => {
    return pipe(
      ctx.db.save(ArticleEntity, [body]),
      TE.map((articles) => articles[0]),
      TE.chainEitherK(toArticleIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
