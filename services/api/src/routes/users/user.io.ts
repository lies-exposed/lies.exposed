import { io } from "@econnessione/shared";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { UserEntity } from "./User.entity";

export const toUserIO = (
  { passwordHash, ...user }: UserEntity
): E.Either<ControllerError, io.http.User.User> => {
  return pipe(
    io.http.User.User.decode({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
