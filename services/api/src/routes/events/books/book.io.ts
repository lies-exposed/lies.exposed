import { Book } from "@liexp/shared/lib/io/http/Events";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toBookIO = (
  book: EventV2Entity,
): E.Either<ControllerError, Book.Book> => {
  return pipe(
    Book.Book.decode({
      ...book,
      excerpt: book.excerpt ?? undefined,
      body: book.body ?? undefined,
      date: book.date.toISOString(),
      media: book.media ?? [],
      links: book.links ?? [],
      keywords: book.keywords ?? [],
      stories: book.stories ?? [],
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      deletedAt: book.deletedAt?.toISOString() ?? undefined,
    }),
    E.mapLeft((errors) => DecodeError("Failed to decode book", errors)),
  );
};
