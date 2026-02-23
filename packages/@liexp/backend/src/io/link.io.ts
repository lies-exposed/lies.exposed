import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { type Media } from "@liexp/io/lib/http/Media/Media.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type LinkEntity } from "../entities/Link.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toLinkIO = (
  link: LinkEntity,
): E.Either<DecodeError, io.http.Link.Link> => {
  const media: E.Either<DecodeError, Media | UUID | undefined> = link.image
    ? Schema.is(UUID)(link.image)
      ? E.right(link.image)
      : MediaIO.decodeSingle(link.image)
    : E.right(undefined);

  return pipe(
    media,
    E.chain((image) =>
      pipe(
        {
          ...link,
          title: link.title ?? undefined,
          description: link.description ?? undefined,
          image,
          provider: Schema.is(UUID)(link.provider) ? link.provider : undefined,
          creator: Schema.is(UUID)(link.creator) ? link.creator : undefined,
          publishDate: link.publishDate ?? undefined,
          events: (link.events ?? []).map((e) =>
            Schema.is(UUID)(e) ? e : e.id,
          ),
          keywords: (link.keywords ?? []).map((k) =>
            Schema.is(UUID)(k) ? k : k.id,
          ),
          socialPosts: link.socialPosts ?? [],
        },
        Schema.validateEither(io.http.Link.Link),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode link (${link.id})`, e),
        ),
      ),
    ),
  );
};

export const LinkIO = IOCodec(
  io.http.Link.Link,
  {
    decode: toLinkIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "link",
);
