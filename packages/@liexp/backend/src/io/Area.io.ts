import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type AreaEntity } from "../entities/Area.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toAreaIO = (
  { featuredImage, ...area }: AreaEntity,
  spaceEndpoint: string,
): E.Either<_DecodeError, io.http.Area.Area> => {
  return pipe(
    featuredImage
      ? MediaIO.decodeSingle(featuredImage, spaceEndpoint)
      : E.right<_DecodeError, io.http.Media.Media | null>(null),
    fp.E.chain((media) =>
      pipe(
        {
          ...area,
          featuredImage: media
            ? {
                ...media,
                createdAt: media.createdAt.toISOString(),
                updatedAt: media.updatedAt.toISOString(),
              }
            : null,
          media: (area.media ?? []).map((m) => (Schema.is(UUID)(m) ? m : m.id)),
          events: (area.events ?? []).map((e) =>
            Schema.is(UUID)(e) ? e : e.id,
          ),
          socialPosts: area.socialPosts ?? [],
          geometry: area.geometry,
          createdAt: area.createdAt.toISOString(),
          updatedAt: area.updatedAt.toISOString(),
          deletedAt: area.deletedAt?.toISOString(),
        },
        Schema.decodeUnknownEither(io.http.Area.Area),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode area (${area.id})`, e),
        ),
      ),
    ),
  );
};

export const AreaIO = IOCodec(
  io.http.Area.Area,
  {
    decode: toAreaIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "area",
);
