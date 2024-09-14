import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import * as E from "fp-ts/lib/Either.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toMediaIO = (
  media: MediaEntity,
  spaceEndpoint: string,
): E.Either<ControllerError, io.http.Media.Media> => {
  return pipe(
    io.http.Media.AdminMedia.decode({
      ...media,
      label: media.label ?? undefined,
      description: media.description ?? undefined,
      location: ensureHTTPS(media.location),
      creator: media.creator ?? undefined,
      extra: media.extra ?? undefined,
      links: media.links ?? [],
      events: media.events ?? [],
      keywords: media.keywords ?? [],
      areas: media.areas ?? [],
      featuredInStories: media.featuredInStories ?? [],
      socialPosts: media.socialPosts ?? [],
      thumbnail: media.thumbnail ? ensureHTTPS(media.thumbnail) : undefined,
      transferable: !media.location.includes(spaceEndpoint),
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      deletedAt: media.deletedAt?.toISOString() ?? undefined,
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e)),
  );
};

export const MediaIO = IOCodec(toMediaIO, "media");
