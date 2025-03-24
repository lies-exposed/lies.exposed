import { type SettingEntity } from "@liexp/backend/lib/entities/Setting.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toSettingIO = ({
  value,
  id,
  ...setting
}: SettingEntity): E.Either<
  ControllerError,
  Schema.Schema.Encoded<typeof io.http.Setting.Setting>
> => {
  return pipe(
    {
      id,
      value: JSON.stringify(value),
      createdAt: setting.createdAt.toISOString(),
      updatedAt: setting.updatedAt.toISOString(),
    },
    Schema.encodeUnknownEither(io.http.Setting.Setting),
    E.mapLeft((e) => DecodeError.of(`Failed to decode setting (${id})`, e)),
  );
};
