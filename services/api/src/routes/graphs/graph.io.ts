import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type GraphEntity } from "#entities/Graph.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toGraphIO = (
  a: GraphEntity,
): E.Either<ControllerError, io.http.Graph.Graph> => {
  return pipe(
    io.http.Graph.Graph.decode({
      ...a,
      type: a.graphType,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError.of(`Failed to decode actor (${a.id})`, e)),
  );
};

export const GraphIO = IOCodec(toGraphIO, "graph");
