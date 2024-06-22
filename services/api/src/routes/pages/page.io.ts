import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/Either";
import { type PageEntity } from "#entities/Page.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

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
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e)),
  );
};
