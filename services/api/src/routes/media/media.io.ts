import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toImageIO = (
  media: MediaEntity
): E.Either<ControllerError, io.http.Media.Media> => {
  return pipe(
    io.http.Media.Media.decode({
      ...media,
      thumbnail: media.thumbnail ?? undefined,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e))
  );
};
