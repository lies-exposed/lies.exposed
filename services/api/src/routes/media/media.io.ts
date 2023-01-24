import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type MediaEntity } from "@entities/Media.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toImageIO = (
  media: MediaEntity
): E.Either<ControllerError, io.http.Media.Media> => {
  return pipe(
    io.http.Media.Media.decode({
      ...media,
      creator: media.creator ?? undefined,
      links: media.links ?? [],
      events: media.events ?? [],
      keywords: media.keywords ?? [],
      thumbnail: media.thumbnail ?? undefined,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      deletedAt: media.deletedAt?.toISOString() ?? undefined
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e))
  );
};
