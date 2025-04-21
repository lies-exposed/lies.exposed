import { type GraphEntity } from "@liexp/backend/lib/entities/Graph.entity.js";
import { IOCodec } from "@liexp/backend/lib/io/DomainCodec.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

const toGraphIO = (
  a: GraphEntity,
): E.Either<ControllerError, io.http.Graph.Graph> => {
  return pipe(
    {
      ...a,
      type: a.graphType,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    },
    Schema.decodeUnknownEither(io.http.Graph.Graph),
    E.mapLeft((e) => DecodeError.of(`Failed to decode actor (${a.id})`, e)),
  );
};

export const GraphIO = IOCodec(
  io.http.Graph.Graph,
  {
    decode: toGraphIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "graph",
);
