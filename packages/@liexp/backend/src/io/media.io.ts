import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { MediaExtraMonoid } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { type MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/url.utils.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type MediaEntity } from "../entities/Media.entity.js";
import { IOCodec } from "./DomainCodec.js";

export type SimpleMedia<T extends MediaType = MediaType> = Pick<
  MediaEntity,
  "id" | "location" | "thumbnail"
> & {
  type: T;
};

const encodeMedia = (
  media: MediaEntity,
  spaceEndpoint: string,
): E.Either<
  _DecodeError,
  Schema.Schema.Encoded<typeof io.http.Media.AdminMedia>
> => {
  return pipe(
    Schema.encodeEither(io.http.Media.AdminMedia)({
      ...media,
      label: media.label ?? media.location,
      description: media.description ?? undefined,
      thumbnail: media.thumbnail ? ensureHTTPS(media.thumbnail) : undefined,
      transferable: !media.location.includes(spaceEndpoint),
      creator: Schema.is(UUID)(media.creator)
        ? media.creator
        : media.creator?.id,
      extra: media.extra
        ? MediaExtraMonoid.concat(MediaExtraMonoid.empty, media.extra)
        : undefined,
      featuredInStories: media.featuredInStories?.map((s) => s.id) ?? [],
      socialPosts: media.socialPosts?.map((s) => s.id) ?? [],
      events: media.events?.map((e) => (Schema.is(UUID)(e) ? e : e.id)) ?? [],
      keywords:
        media.keywords?.map((k) => (Schema.is(UUID)(k) ? k : k.id)) ?? [],
      areas: media.areas?.map((a) => (Schema.is(UUID)(a) ? a : a.id)) ?? [],
      links: media.links?.map((l) => (Schema.is(UUID)(l) ? l : l.id)) ?? [],
      deletedAt: media.deletedAt ?? undefined,
    }),
    E.mapLeft((e) => DecodeError.of(`Failed to encode media (${media.id})`, e)),
  );
};
const decodeMedia = (
  media: MediaEntity,
  spaceEndpoint: string,
): E.Either<_DecodeError, io.http.Media.AdminMedia> => {
  const extra = media.extra
    ? MediaExtraMonoid.concat(MediaExtraMonoid.empty, media.extra)
    : undefined;

  return pipe(
    {
      ...media,
      label: media.label ?? media.location,
      description: media.description ?? undefined,
      location: ensureHTTPS(media.location),
      creator: Schema.is(UUID)(media.creator)
        ? media.creator
        : media.creator?.id,
      extra,
      links: media.links ?? [],
      events: (media.events ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
      keywords: media.keywords ?? [],
      areas: (media.areas ?? []).map((a) => (Schema.is(UUID)(a) ? a : a.id)),
      featuredInStories: media.featuredInStories ?? [],
      socialPosts: media.socialPosts ?? [],
      thumbnail: media.thumbnail ? ensureHTTPS(media.thumbnail) : undefined,
      transferable: !media.location.includes(spaceEndpoint),
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      deletedAt: media.deletedAt?.toISOString() ?? undefined,
    },
    Schema.decodeUnknownEither(io.http.Media.AdminMedia),
    E.mapLeft((e) => DecodeError.of(`Failed to decode media (${media.id})`, e)),
  );
};

export const MediaIO = IOCodec(
  io.http.Media.AdminMedia,
  {
    decode: decodeMedia,
    encode: encodeMedia,
  },
  "media",
);
