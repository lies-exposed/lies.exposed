import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toTransactionIO = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Transaction.Transaction> => {
  return pipe(
    {
      ...event,
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString() ?? undefined,
    },
    Schema.decodeUnknownEither(io.http.Events.Transaction.Transaction),
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
