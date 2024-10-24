import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Book } from "@liexp/shared/lib/io/http/Events/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toBookIO = (
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

export const BookIO = IOCodec(toBookIO, "book");
