import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Book } from "@liexp/shared/lib/io/http/Events/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toBookIO = (book: EventV2Entity): E.Either<_DecodeError, Book.Book> => {
  return pipe(
    {
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
    },
    Schema.decodeUnknownEither(Book.Book),
    E.mapLeft((errors) => DecodeError.of("Failed to decode book", errors)),
  );
};

export const BookIO = IOCodec(toBookIO, "book");
