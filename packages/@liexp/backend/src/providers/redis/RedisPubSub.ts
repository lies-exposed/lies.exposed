import { fp } from "@liexp/core/lib/fp/index.js";
import { type ParseError } from "effect/ParseResult";
import { type Either } from "fp-ts/lib/Either.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type { LoggerContext } from "../../context/logger.context.js";
import type { RedisContext } from "../../context/redis.context.js";
import { type RedisError, toRedisError } from "./redis.error.js";

export interface RedisPubSub<T, K> {
  channel: K;
  decoder: (u: unknown) => Either<ParseError, T>;
  publish: <C extends LoggerContext & RedisContext>(
    message: T,
  ) => ReaderTaskEither<C, RedisError, number>;
}

export const RedisPubSub = <T, K extends string = string>(
  channel: K,
  decoder: (u: unknown) => Either<ParseError, T>,
): RedisPubSub<T, K> => {
  return {
    channel,
    decoder,
    publish:
      (message) =>
      ({ redis, logger }) => {
        return pipe(
          TE.tryCatch(async () => {
            const count = await redis.client.publish(
              channel,
              JSON.stringify(message),
            );
            logger.debug.log(`Published message to channel ${channel}`);
            return count;
          }, toRedisError),
          fp.TE.filterOrElse(
            (c) => c > 0,
            () =>
              toRedisError(
                new Error(`Failed to publish message on channel: ${channel}`),
              ),
          ),
        );
      },
  };
};
