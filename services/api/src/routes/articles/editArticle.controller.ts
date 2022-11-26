import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "@routes/route.types";

export const MakeEditArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Article.Edit,
    ({ params: { id }, body: { featuredImage, body2, ...body } }) => {
      return pipe(
        ctx.db.findOneOrFail(ArticleEntity, { where: { id: Equal(id) } }),
        TE.chain((e) =>
          ctx.db.save(ArticleEntity, [
            {
              ...e,
              ...body,
              body2: body2 as any,
              featuredImage: {
                id: pipe(
                  featuredImage,
                  O.map((f) => f.id),
                  O.getOrElse(() => e.featuredImage?.id)
                ),
              },
            },
          ])
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(ArticleEntity, { where: { id: Equal(id) } })
        ),
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
