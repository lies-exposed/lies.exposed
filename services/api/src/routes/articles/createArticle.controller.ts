import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "@routes/route.types";

export const MakeCreateArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Article.Create, ({ body }) => {
    const featuredImage = pipe(body.featuredImage, O.toNullable);
    return pipe(
      ctx.db.save(ArticleEntity, [
        {
          ...body,
          featuredImage: featuredImage ? { id: featuredImage } : null,
        },
      ]),
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
