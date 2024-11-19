import { type FSClientContext } from "@liexp/backend/lib/context/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { parse } from "fp-ts/lib/Json.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type Decoder } from "io-ts";
import { type AIBotError } from "../error/index.js";
import { toAIBotError } from "#common/error/index.js";

export interface ConfigProvider<C extends Record<string, unknown>> {
  config: C;
  save: (config: C) => void;
}

export const ConfigProviderReader =
  <
    C extends Record<string, unknown>,
    R extends FSClientContext = FSClientContext,
  >(
    path: string,
    decoder: Decoder<unknown, C>,
  ): ReaderTaskEither<R, AIBotError, ConfigProvider<C>> =>
  (ctx) => {
    return pipe(
      ctx.fs.getObject(path),
      fp.TE.chainEitherK((config) => {
        return pipe(parse(config), fp.E.mapLeft(toAIBotError));
      }),
      fp.TE.chainEitherK((e) =>
        pipe(
          decoder.decode(e),
          fp.E.mapLeft(
            (errors): AIBotError =>
              DecodeError.of("Can't parse configuration", errors),
          ),
        ),
      ),
      fp.TE.map(
        (config): ConfigProvider<C> => ({
          config: config,
          save: (config) => ctx.fs.writeObject(path, JSON.stringify(config)),
        }),
      ),
    );
  };
