import { fp } from "@liexp/core/lib/fp/index.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { failure } from "io-ts/lib/PathReporter.js";
import type { LoggerContext } from "../../context/logger.context.js";
import type { RedisContext } from "../../context/redis.context.js";
import type { RedisPubSub } from "./RedisPubSub.js";
import { RedisError, toRedisError } from "./redis.error.js";

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
