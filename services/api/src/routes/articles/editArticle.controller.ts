import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeEditArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["event-suggestion:create"]))(
    Endpoints.Article.Edit,
    (
      { params: { id }, body: { featuredImage, body2, creator, ...body } },
      r
    ) => {
      return pipe(
        ctx.db.findOneOrFail(ArticleEntity, { where: { id: Equal(id) } }),
        TE.chain((e) => {
          const featuredImageId = pipe(
            featuredImage,
            O.map((f) => f.id),
            O.getOrElse(() => e.featuredImage as any)
          );

          ctx.logger.debug.log("Featured image %O", featuredImageId);

          return ctx.db.save(ArticleEntity, [
            {
              ...e,
              ...body,
              body2: body2 as any,
              creator: creator as any,
              featuredImage: featuredImageId,
            },
          ]);
        }),
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
