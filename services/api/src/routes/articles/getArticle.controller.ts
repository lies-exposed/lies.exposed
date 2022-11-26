import { ArticleEntity } from "@entities/Article.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Route } from "../route.types";
import { toArticleIO } from "./article.io";

export const MakeGetArticleRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Article.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ArticleEntity, {
        where: { id },
        relations: ["featuredImage"],
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
