import * as io from "@econnessione/shared/io";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { AreaEntity } from "../../entities/Area.entity";

export const toAreaIO = (
  a: AreaEntity
): E.Either<ControllerError, io.http.Area.Area> => {
  return pipe(
    io.http.Area.Area.decode({
      ...a,
      geometry: a.geometry,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
