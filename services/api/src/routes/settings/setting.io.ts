import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type SettingEntity } from "#entities/Setting.entity.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toSettingIO = ({
  value,
  id,
  ...setting
}: SettingEntity): E.Either<ControllerError, io.http.Setting.Setting> => {
  return pipe(
    io.http.Setting.Setting.decode({
      id,
      value: JSON.stringify(value),
      createdAt: setting.createdAt.toISOString(),
      updatedAt: setting.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode setting (${id})`, e)),
  );
};
