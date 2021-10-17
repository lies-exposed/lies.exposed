import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ImageEntity } from "@entities/Image.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toImageIO = (
  a: ImageEntity
): E.Either<ControllerError, io.http.Image.Image> => {
  return pipe(
    io.http.Image.Image.decode({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
