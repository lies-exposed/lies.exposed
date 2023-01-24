import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Route } from "../route.types";
import { toArticleIO } from "./article.io";
import { ArticleEntity } from "@entities/Article.entity";

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
