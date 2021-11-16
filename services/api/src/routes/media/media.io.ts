import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toImageIO = (
  a: MediaEntity
): E.Either<ControllerError, io.http.Media.Media> => {
  return pipe(
    io.http.Media.Media.decode({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
