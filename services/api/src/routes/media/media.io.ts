import * as io from "@liexp/shared/lib/io";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type MediaEntity } from "@entities/Media.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toMediaIO = (
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
      featuredIn: media.featuredIn ?? [],
      thumbnail: media.thumbnail ? ensureHTTPS(media.thumbnail) : undefined,
      transferable: !media.location.includes(spaceEndpoint),
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      deletedAt: media.deletedAt?.toISOString() ?? undefined,
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e)),
  );
};
