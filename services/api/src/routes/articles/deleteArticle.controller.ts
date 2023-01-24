import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeDeleteArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.Article.Delete,
    ({ params: { id } }, r) => {
      return pipe(
        ctx.db.findOneOrFail(ArticleEntity, { where: { id: Equal(id) } }),
        TE.chainFirst((e) => ctx.db.delete(ArticleEntity, [id])),
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
