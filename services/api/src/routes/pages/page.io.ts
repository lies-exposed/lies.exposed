import { type PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toPageIO = (
  media: PageEntity,
): E.Either<ControllerError, io.http.Page.Page> => {
  return pipe(
    io.http.Page.Page.decode({
      ...media,
      body: media.body ?? undefined,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError.of(`Failed to decode media (${media.id})`, e)),
  );
};
