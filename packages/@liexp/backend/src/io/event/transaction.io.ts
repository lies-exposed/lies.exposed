import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toTransactionIO = (
  event: EventV2Entity,
): E.Either<DecodeError, io.http.Events.Transaction.Transaction> => {
  return pipe(
    {
      ...event,
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
      deletedAt: event.deletedAt ?? undefined,
    },
    Schema.validateEither(io.http.Events.Transaction.Transaction),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode Transaction (${event.id})`, e),
    ),
  );
};

export const TransactionIO = IOCodec(
  io.http.Events.Transaction.Transaction,
  {
    decode: toTransactionIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "Transaction",
);
