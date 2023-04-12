import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type ArticleEntity } from "@entities/Article.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toArticleIO = ({
  body,
  body2,
  ...article
}: ArticleEntity): E.Either<ControllerError, io.http.Article.Article> => {
  return pipe(
    io.http.Article.Article.decode({
      ...article,
      type: "Article",
      creator: article.creator ?? undefined,
      body,
      body2,
      links: [],
      featuredImage: article.featuredImage
        ? {
            ...article.featuredImage,
            thumbnail: article.featuredImage.thumbnail ?? undefined,
            createdAt: article.featuredImage.createdAt.toISOString(),
            updatedAt: article.featuredImage.updatedAt.toISOString(),
            deletedAt: article.featuredImage.deletedAt?.toISOString(),
            keywords: [],
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
