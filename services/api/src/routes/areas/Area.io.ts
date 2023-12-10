import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type AreaEntity } from "../../entities/Area.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

export const toAreaIO = (
  a: AreaEntity,
): E.Either<ControllerError, io.http.Area.Area> => {
  return pipe(
    io.http.Area.Area.decode({
      ...a,
      media: a.media ?? [],
      socialPosts: a.socialPosts ?? [],
      geometry: a.geometry,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode area (${a.id})`, e)),
  );
};
