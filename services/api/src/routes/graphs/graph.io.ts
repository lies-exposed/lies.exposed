import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type GraphEntity } from "#entities/Graph.entity.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";

export const toGraphIO = (
  a: GraphEntity,
): E.Either<ControllerError, io.http.Graph.Graph> => {
  return pipe(
    io.http.Graph.Graph.decode({
      ...a,
      type: a.graphType,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode actor (${a.id})`, e)),
  );
};
