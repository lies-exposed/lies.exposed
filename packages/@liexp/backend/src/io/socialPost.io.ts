import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { SocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { IOError } from "ts-io-error";
import { type SocialPostEntity } from "../entities/SocialPost.entity.js";
import { IOCodec } from "./DomainCodec.js";

const encodeSocialPost = (
  socialPost: SocialPostEntity,
): E.Either<_DecodeError, typeof SocialPost.Encoded> => {
  return pipe(
    {
      ...socialPost,
      createdAt: socialPost.createdAt.toISOString(),
      updatedAt: socialPost.updatedAt.toISOString(),
      deletedAt: socialPost.deletedAt?.toISOString(),
    },
    Schema.encodeUnknownEither(SocialPost),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode link (${socialPost.id})`, e),
    ),
  );
};

export const SocialPostIO = IOCodec(
  SocialPost,
  {
    decode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
    encode: encodeSocialPost,
  },
  "link",
);
