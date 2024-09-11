import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toUserIO = ({
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

export const UserIO = IOCodec(toUserIO, "user");
