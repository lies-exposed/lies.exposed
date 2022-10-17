import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { AreaEntity } from "../../entities/Area.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toAreaIO = (
  a: AreaEntity
): E.Either<ControllerError, io.http.Area.Area> => {
  return pipe(
    io.http.Area.Area.decode({
      ...a,
      media: a.media ?? [],
      geometry: a.geometry,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode area (${a.id})`, e))
  );
};
