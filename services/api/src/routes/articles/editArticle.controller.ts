import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "@routes/route.types";

export const MakeEditArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Article.Edit,
    ({ params: { id }, body: { featuredImage, ...body } }) => {
      return pipe(
        ctx.db.findOneOrFail(ArticleEntity, { where: { id: Equal(id) } }),
        TE.chain((e) =>
          ctx.db.save(ArticleEntity, [
            {
              ...e,
              ...body,
              featuredImage: pipe(
                featuredImage,
                O.getOrElse(() => e.featuredImage)
              ),
            },
          ])
        ),
        TE.map((articles) => articles[0]),
        TE.chainEitherK(toArticleIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
