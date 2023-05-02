import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["event-suggestion:create"]))(
    Endpoints.Article.Create,
    ({ body: { body2, keywords, ...body } }, r) => {
      const featuredImage = pipe(body.featuredImage, O.toNullable);
      return pipe(
        ctx.db.save(ArticleEntity, [
          {
            ...body,
            body: "",
            body2: body2 as any,
            creator: { id: r.user?.id },
            keywords: keywords.map((k) => ({ id: k })),
            featuredImage: featuredImage ? { id: featuredImage } : null,
          },
        ]),
        TE.chain(([article]) =>
          ctx.db.findOneOrFail(ArticleEntity, {
            where: { id: article.id },
            loadRelationIds: {
              relations: ["keywords"],
            },
          })
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
