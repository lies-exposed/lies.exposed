import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type PageEntity } from "@entities/Page.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toPageIO = (
  media: PageEntity
): E.Either<ControllerError, io.http.Page.Page> => {
  return pipe(
    io.http.Page.Page.decode({
      ...media,
      body: media.body ?? undefined,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode media (${media.id})`, e))
  );
};
