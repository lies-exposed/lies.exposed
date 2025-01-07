import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { IOCodec } from "@liexp/backend/lib/io/DomainCodec.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

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
    E.mapLeft((e) => DecodeError.of(`Failed to decode user (${user.id})`, e)),
  );
};

export const UserIO = IOCodec(toUserIO, "user");
