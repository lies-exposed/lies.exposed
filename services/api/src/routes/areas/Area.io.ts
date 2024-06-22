import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/Either";
import { type AreaEntity } from "../../entities/Area.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { toMediaIO } from "#routes/media/media.io.js";

export const toAreaIO = (
  { featuredImage, ...area }: AreaEntity,
  spaceEndpoint: string,
): E.Either<ControllerError, io.http.Area.Area> => {
  return pipe(
    featuredImage
      ? toMediaIO(featuredImage, spaceEndpoint)
      : E.right<ControllerError, io.http.Media.Media | null>(null),
    fp.E.chain((media) =>
      pipe(
        io.http.Area.Area.decode({
          ...area,
          featuredImage: media
            ? {
                ...media,
                createdAt: media.createdAt.toISOString(),
                updatedAt: media.updatedAt.toISOString(),
              }
            : null,
          media: (area.media ?? []).map((m) =>
            io.http.Common.UUID.is(m) ? m : m.id,
          ),
          events: (area.events ?? []).map((e) =>
            io.http.Common.UUID.is(e) ? e : e.id,
          ),
          socialPosts: area.socialPosts ?? [],
          geometry: area.geometry,
          createdAt: area.createdAt.toISOString(),
          updatedAt: area.updatedAt.toISOString(),
        }),
        E.mapLeft((e) => DecodeError(`Failed to decode area (${area.id})`, e)),
      ),
    ),
  );
};
