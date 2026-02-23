import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Book } from "@liexp/io/lib/http/Events/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toBookIO = (book: EventV2Entity): E.Either<DecodeError, Book.Book> => {
  return pipe(
    {
      ...book,
      excerpt: book.excerpt ?? undefined,
      body: book.body ?? undefined,
      media: book.media ?? [],
      links: book.links ?? [],
      keywords: book.keywords ?? [],
      stories: book.stories ?? [],
    },
    Schema.validateEither(Book.Book),
    E.mapLeft((errors) => DecodeError.of("Failed to decode book", errors)),
  );
};

export const BookIO = IOCodec(
  Book.Book,
  {
    decode: toBookIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "book",
);
