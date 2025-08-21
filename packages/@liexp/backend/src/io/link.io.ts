import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type LinkEntity } from "../entities/Link.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toLinkIO = (
  link: LinkEntity,
): E.Either<_DecodeError, io.http.Link.Link> => {
  const media: E.Either<_DecodeError, Media | UUID | undefined> = link.image
    ? Schema.is(UUID)(link.image)
      ? E.right(link.image)
      : MediaIO.decodeSingle(link.image)
    : E.right(undefined);

  return pipe(
    media,
    E.map((image) => ({
      ...link,
      title: link.title ?? undefined,
      description: link.description ?? undefined,
      image,
      provider: Schema.is(UUID)(link.provider) ? link.provider : undefined,
      creator: Schema.is(UUID)(link.creator) ? link.creator : undefined,
      publishDate: link.publishDate?.toISOString() ?? undefined,
      events: (link.events ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
      keywords: (link.keywords ?? []).map((k) =>
        Schema.is(UUID)(k) ? k : k.id,
      ),
      socialPosts: link.socialPosts ?? [],
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      deletedAt: link.deletedAt?.toISOString(),
    })),
    E.chain((link) =>
      pipe(
        Schema.decodeUnknownEither(io.http.Link.Link)(link),
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
