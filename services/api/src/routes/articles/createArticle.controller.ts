import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "@routes/route.types";
import * as O from 'fp-ts/lib/Option'
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toArticleIO } from "./article.io";

export const MakeCreateArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Article.Create,
    ({ body }) => {
      const featuredImage = pipe(
        body.featuredImage,
        O.toNullable
      )
      return pipe(
        ctx.db.save(ArticleEntity, [{  ...body, featuredImage }]),
        TE.map((articles) => articles[0]),
        TE.chainEitherK(toArticleIO),
        TE.map((data) => ({
          body: {
            data
          },
          statusCode: 200
        }))
      );
    }
  );
};
