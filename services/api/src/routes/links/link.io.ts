import * as io from "@econnessione/shared/io";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toLinkIO = (
  link: LinkEntity
): E.Either<ControllerError, io.http.Link.Link> => {
  return pipe(
    io.http.Link.Link.decode({
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
