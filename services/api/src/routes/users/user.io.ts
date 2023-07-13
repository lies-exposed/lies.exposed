import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type UserEntity } from "@entities/User.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toUserIO = ({
  passwordHash,
  ...user
}: UserEntity): E.Either<ControllerError, io.http.User.User> => {
  return pipe(
    io.http.User.User.decode({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode user (${user.id})`, e)),
  );
};
