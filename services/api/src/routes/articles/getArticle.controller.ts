import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Route } from "../route.types";
import { ArticleEntity } from "@entities/Article.entity";
import { toArticleIO } from "./article.io";

export const MakeGetArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Article.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ArticleEntity, {
        where: { id },
        relations: ["featuredImage"],
        loadRelationIds: {
          relations: ["creator", 'keywords'],
        },
      }),
      TE.chainEitherK(toArticleIO),
      TE.map((article) => ({
        body: {
          data: article,
        },
        statusCode: 200,
      }))
    );
  });
};
