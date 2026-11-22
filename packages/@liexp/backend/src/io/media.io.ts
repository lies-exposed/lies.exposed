import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import {
  MediaExtraMonoid,
  VideoExtraMonoid,
  type MediaExtra,
  type VideoExtra,
} from "@liexp/io/lib/http/Media/MediaExtra.js";
import { type MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import * as io from "@liexp/io/lib/index.js";
import { ensureHTTPProtocol } from "@liexp/shared/lib/utils/url.utils.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type MediaEntity } from "../entities/Media.entity.js";
import {
  type DateFieldSpec,
  dateToISOOrRaw,
  dateToDateOrRaw,
  describeInvalidDateFields,
} from "../utils/date.utils.js";
import { IOCodec } from "./DomainCodec.js";

const MEDIA_DATE_FIELDS: readonly DateFieldSpec[] = [
  { field: "createdAt" },
  { field: "updatedAt" },
  { field: "deletedAt", allowNullish: true },
];

export type SimpleMedia<T extends MediaType = MediaType> = Pick<
  MediaEntity,
  "id" | "location" | "thumbnail"
> & {
  type: T;
};

const getExtraWithDefaults = (media: MediaEntity): MediaExtra | undefined => {
  const extra = media.extra;
  if (!extra) return undefined;
  if (media.type === "video/mp4") {
    return VideoExtraMonoid.concat(VideoExtraMonoid.empty, extra as VideoExtra);
  }
  return MediaExtraMonoid.concat(MediaExtraMonoid.empty, extra);
};

const encodeMedia = (
  media: MediaEntity,
): E.Either<
  DecodeError,
  Schema.Schema.Encoded<typeof io.http.Media.AdminMedia>
> => {
  const extra = getExtraWithDefaults(media);

  return pipe(
    Schema.encodeEither(io.http.Media.AdminMedia)({
      ...media,
      location: ensureHTTPProtocol(media.location),
      label: media.label ?? media.location,
      description: media.description ?? undefined,
      thumbnail: media.thumbnail
        ? ensureHTTPProtocol(media.thumbnail)
        : undefined,
      transferable: !media.location.startsWith("/"),
      creator: Schema.is(UUID)(media.creator)
        ? media.creator
        : media.creator?.id,
      extra,
      featuredInStories: media.featuredInStories?.map((s) => s.id) ?? [],
      socialPosts: media.socialPosts?.map((s) => s.id) ?? [],
      events: media.events?.map((e) => (Schema.is(UUID)(e) ? e : e.id)) ?? [],
      keywords:
        media.keywords?.map((k) => (Schema.is(UUID)(k) ? k : k.id)) ?? [],
      areas: media.areas?.map((a) => (Schema.is(UUID)(a) ? a : a.id)) ?? [],
      links: media.links?.map((l) => (Schema.is(UUID)(l) ? l : l.id)) ?? [],
      createdAt: dateToDateOrRaw(media.createdAt),
      updatedAt: dateToDateOrRaw(media.updatedAt),
      deletedAt: dateToDateOrRaw(media.deletedAt) ?? undefined,
    }),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to encode media (${media.id})${describeInvalidDateFields(
          media,
          MEDIA_DATE_FIELDS,
        )}`,
        e,
      ),
    ),
  );
};
const decodeMedia = (
  media: MediaEntity,
): E.Either<DecodeError, io.http.Media.AdminMedia> => {
  const extra = getExtraWithDefaults(media);

  return pipe(
    {
      ...media,
      label: media.label ?? media.location,
      description: media.description ?? undefined,
      location: ensureHTTPProtocol(media.location),
      creator: Schema.is(UUID)(media.creator)
        ? media.creator
        : media.creator?.id,
      extra,
      links: (media.links ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
      events: (media.events ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
      keywords: (media.keywords ?? []).map((k) =>
        Schema.is(UUID)(k) ? k : k.id,
      ),
      areas: (media.areas ?? []).map((a) => (Schema.is(UUID)(a) ? a : a.id)),
      featuredInStories: media.featuredInStories ?? [],
      socialPosts: media.socialPosts ?? [],
      thumbnail: media.thumbnail
        ? ensureHTTPProtocol(media.thumbnail)
        : undefined,
      transferable: !media.location.startsWith("/"),
      createdAt: dateToISOOrRaw(media.createdAt),
      updatedAt: dateToISOOrRaw(media.updatedAt),
      deletedAt: dateToISOOrRaw(media.deletedAt) ?? undefined,
    },
    Schema.decodeUnknownEither(io.http.Media.AdminMedia),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to decode media (${media.id})${describeInvalidDateFields(
          media,
          MEDIA_DATE_FIELDS,
        )}`,
        e,
      ),
    ),
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
