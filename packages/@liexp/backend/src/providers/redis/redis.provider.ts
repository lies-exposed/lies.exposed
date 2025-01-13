import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Decoder } from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-io-error";
import { type LoggerContext } from "../../context/logger.context.js";
import { type RedisContext } from "context/redis.context.js";

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

export interface RedisPubSub<T, K> {
  channel: K;
  decoder: Decoder<unknown, T>;
  publish: <C extends LoggerContext & RedisContext>(
    message: T,
  ) => ReaderTaskEither<C, RedisError, number>;
}

export const RedisPubSub = <T, K extends string = string>(
  channel: K,
  decoder: Decoder<unknown, T>,
): RedisPubSub<T, K> => {
  return {
    channel,
    decoder,
    publish:
      (message) =>
      ({ redis, logger }) => {
        return pipe(
          TE.tryCatch(async () => {
            const count = await redis.publish(channel, JSON.stringify(message));
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

export interface Subscriber<C, T, K extends string, E>
  extends RedisPubSub<T, K> {
  subscribe: () => ReaderTaskEither<C, E, void>;
}

export const Subscriber = <
  C extends LoggerContext & RedisContext,
  E,
  T,
  K extends string,
>(
  pubSub: RedisPubSub<T, K>,
  subscribe: (payload: T) => ReaderTaskEither<C, E, void>,
): Subscriber<C, T, K, E | RedisError> => ({
  ...pubSub,
  subscribe: () => (ctx) => {
    return pipe(
      TE.tryCatch(async () => {
        await ctx.redis.subscribe(pubSub.channel);
        ctx.logger.debug.log(`Subscribed to channel ${pubSub.channel}`);
      }, toRedisError),
      fp.RTE.fromTaskEither,
      fp.RTE.map(() => {
        ctx.redis.on("message", (boundChannel, message) => {
          if (boundChannel !== pubSub.channel) {
            return;
          }

          ctx.logger.debug.log(`Received message on channel ${pubSub.channel}`);
          void pipe(
            pubSub.decoder.decode(JSON.parse(message)),
            fp.E.mapLeft(
              (err) =>
                new RedisError("Failed to decode message", {
                  kind: "DecodingError",
                  errors: failure(err),
                }) as E,
            ),
            fp.RTE.fromEither,
            fp.RTE.chainTaskEitherK((message) => subscribe(message)(ctx)),
            fp.RTE.fold(
              (e) => {
                ctx.logger.error.log(
                  `Handling message for channel %s failed: %O`,
                  pubSub.channel,
                  e,
                );
                return () => fp.T.of(undefined);
              },
              () => {
                ctx.logger.debug.log(
                  `Message handled successfully for channel %s`,
                  pubSub.channel,
                );
                return () => fp.T.of(undefined);
              },
            ),
          )(ctx)();
        });
      }),
    )(ctx);
  },
  // task,
});
