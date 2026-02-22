import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { ParseResult, Schema } from "effect/index";
import * as E from "fp-ts/lib/Either.js";
import { type QueueEntity } from "../entities/Queue.entity.js";
import { IOCodec } from "./DomainCodec.js";

/**
 * Schema that decodes from ISO date strings or Date objects to Date objects
 * and encodes Date objects back to ISO strings
 */
const DateFromStringOrDate = Schema.transformOrFail(
  Schema.Union(Schema.String, Schema.Date),
  Schema.Date,
  {
    strict: true,
    decode: (input) => {
      if (input instanceof Date) {
        return ParseResult.succeed(input);
      }
      if (typeof input === "string") {
        const date = new Date(input);
        if (Number.isNaN(date.getTime())) {
          return ParseResult.fail(
            ParseResult.type(Schema.Date, input),
          );
        }
        return ParseResult.succeed(date);
      }
      return ParseResult.fail(ParseResult.type(Schema.Date, input));
    },
    encode: (date) => ParseResult.succeed(date),
  },
);

/**
 * Queue schema decoder that handles both Date objects and ISO date strings
 * This is applied at the IO layer to normalize date formats before schema validation
 */
const QueueWithFlexibleDates = Schema.transformOrFail(
  Schema.Unknown,
  io.http.Queue.Queue,
  {
    strict: true,
    decode: (input) => {
      const queue = input as any;
      return pipe(
        {
          ...queue,
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
          deletedAt: queue.deletedAt ?? null,
        },
        Schema.decodeUnknownEither(
          Schema.Struct({
            ...io.http.Queue.Queue.fields,
            createdAt: DateFromStringOrDate,
            updatedAt: DateFromStringOrDate,
            deletedAt: Schema.NullOr(DateFromStringOrDate),
          }),
        ),
        E.match(
          (error) => ParseResult.fail(error),
          (value) => ParseResult.succeed(value),
        ),
      );
    },
    encode: (queue) => ParseResult.succeed(queue),
  },
);

export const toQueueIO = (
  unknownQueue: QueueEntity | Record<string, unknown>,
): E.Either<DecodeError, io.http.Queue.Queue> => {
  return pipe(
    unknownQueue,
    Schema.decodeUnknownEither(QueueWithFlexibleDates),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to decode queue (${JSON.stringify(unknownQueue)})`,
        e,
      ),
    ),
  );
};

export const QueueIO = IOCodec(
  io.http.Queue.Queue,
  {
    decode: toQueueIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "queue",
);
