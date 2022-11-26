import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ArticleEntity } from "@entities/Article.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toArticleIO = ({
  body,
  body2,
  ...article
}: ArticleEntity): E.Either<ControllerError, io.http.Article.Article> => {

  return pipe(
    io.http.Article.Article.decode({
      ...article,
      type: "Article",
      body,
      body2,
      links: [],
      featuredImage: article.featuredImage
        ? {
            ...article.featuredImage,
            createdAt: article.featuredImage.createdAt.toISOString(),
            updatedAt: article.featuredImage.updatedAt.toISOString(),
            events: [],
            links: [],
          }
        : undefined,
      date: article.date?.toISOString() ?? new Date().toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode article (${article.id})`, e))
  );
};
