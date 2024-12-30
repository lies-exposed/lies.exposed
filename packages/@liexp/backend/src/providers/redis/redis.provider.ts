import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Decoder } from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";
import { type Redis } from "ioredis";
import { IOError } from "ts-io-error";
import { type LoggerContext } from "../../context/logger.context.js";

export class RedisError extends IOError {
  name = "RedisError";
}

const toRedisError = (e: unknown): RedisError => {
  if (e instanceof IOError) {
    return e as RedisError;
  }

  if (e instanceof Error) {
    return new RedisError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: [e.name, e.stack],
    });
  }

  return new RedisError("An error occurred", {
    kind: "ServerError",
    status: "500",
    meta: [String(e)],
  });
};

export type Subscriber<K extends string, T, C, E extends RedisError> = {
  channel: K;
  decoder: Decoder<unknown, T>;
  task: (message: T) => ReaderTaskEither<C, E, void>;
};

export const Subscriber = <K extends string, T, C, E extends RedisError>(
  channel: K,
  decoder: Decoder<unknown, T>,
  task: (message: T) => ReaderTaskEither<C, E, void>,
): Subscriber<K, T, C, E> => ({
  channel,
  decoder,
  task,
});

export interface RedisPubSub<T, C> {
  publish: (message: T) => ReaderTaskEither<C, RedisError, number>;
  subscribe: () => ReaderTaskEither<C, RedisError, void>;
}

export const RedisPubSub = <
  C extends LoggerContext & { redis: Redis },
  T,
  E extends RedisError,
  K extends string = string,
>(
  sub: Subscriber<K, T, C, E>,
): RedisPubSub<T, C> => {
  return {
    publish:
      (message) =>
      ({ redis, logger }) => {
        return pipe(
          TE.tryCatch(async () => {
            const count = await redis.publish(
              sub.channel,
              JSON.stringify(message),
            );
            logger.debug.log(`Published message to channel ${sub.channel}`);
            return count;
          }, toRedisError),
          fp.TE.filterOrElse(
            (c) => c > 0,
            () => toRedisError(new Error("Failed to publish message")),
          ),
        );
      },
    subscribe: () => (ctx) => {
      return pipe(
        TE.tryCatch(async () => {
          await ctx.redis.subscribe(sub.channel);
          ctx.logger.debug.log(`Subscribed to channel ${sub.channel}`);
        }, toRedisError),
        fp.RTE.fromTaskEither,
        fp.RTE.map(() => {
          ctx.redis.on("message", (boundChannel, message) => {
            if (boundChannel !== sub.channel) {
              return;
            }

            ctx.logger.debug.log(`Received message on channel ${sub.channel}`);
            void pipe(
              sub.decoder.decode(JSON.parse(message)),
              fp.E.mapLeft(
                (err) =>
                  new RedisError("Failed to decode message", {
                    kind: "DecodingError",
                    errors: failure(err),
                  }) as any,
              ),
              fp.RTE.fromEither,
              fp.RTE.chain(sub.task),
              fp.RTE.fold(
                (e) => {
                  ctx.logger.error.log(
                    `Handling message for channel %s failed: %O`,
                    sub.channel,
                    e,
                  );
                  return () => fp.T.of(undefined);
                },
                () => {
                  ctx.logger.debug.log(
                    `Message handled successfully for channel %s`,
                    sub.channel,
                  );
                  return () => fp.T.of(undefined);
                },
              ),
            )(ctx);
          });
        }),
      )(ctx);
    },
  };
};
