import * as io from "@econnessione/shared/io";
import { ArticleEntity } from "@entities/Article.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toArticleIO = (
  article: ArticleEntity
): E.Either<ControllerError, io.http.Article.Article> => {
  return pipe(
    io.http.Article.Article.decode({
      ...article,
      type: "Article",
      links: [],
      featuredImage: article.featuredImage ?? "",
      date: article.date?.toISOString() ?? new Date().toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
