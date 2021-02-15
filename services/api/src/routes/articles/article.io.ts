import { io } from "@econnessione/shared";
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
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
