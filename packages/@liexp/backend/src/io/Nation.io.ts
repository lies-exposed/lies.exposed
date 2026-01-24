import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type NationEntity } from "../entities/Nation.entity.js";
import { IOCodec } from "./DomainCodec.js";

const toNationIO = (
  nation: NationEntity,
): E.Either<DecodeError, io.http.Nation.Nation> => {
  return pipe(
    {
      ...nation,
      actors: (nation.actors ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
      createdAt: nation.createdAt,
      updatedAt: nation.updatedAt,
      deletedAt: nation.deletedAt,
    },
    E.right<DecodeError, io.http.Nation.Nation>,
  );
};

export const NationIO = IOCodec(
  io.http.Nation.Nation,
  {
    decode: toNationIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "area",
);
