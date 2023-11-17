import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type AreaEntity } from "../../entities/Area.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

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
