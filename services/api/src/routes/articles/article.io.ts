import { io } from "@econnessione/shared";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ArticleEntity } from "./article.entity";

export const toArticleIO = (
  article: ArticleEntity
): E.Either<ControllerError, io.http.Article.Article> => {
  return pipe(
    io.http.Article.Article.decode({
      ...article,
      type: "Article",
      featuredImage: "",
      links: [],
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
