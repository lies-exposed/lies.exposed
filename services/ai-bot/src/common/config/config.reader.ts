import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import { parse } from "fp-ts/lib/Json.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type AIBotError } from "../error/index.js";
import { toAIBotError } from "#common/error/index.js";

export interface ConfigProvider<C extends Record<string, unknown>> {
  config: C;
  save: (config: C) => void;
}

export const ConfigProviderReader =
  <C extends Schema.Schema<any>, R extends FSClientContext = FSClientContext>(
    path: string,
    decoder: C,
  ): ReaderTaskEither<
    R,
    AIBotError,
    ConfigProvider<Schema.Schema.Encoded<C>>
  > =>
  (ctx) => {
    return pipe(
      ctx.fs.getObject(path),
      fp.TE.chainEitherK((config) => {
        return pipe(parse(config), fp.E.mapLeft(toAIBotError));
      }),
      fp.TE.chainEitherK((e) =>
        pipe(
          Schema.decodeUnknownEither(decoder)(e),
          fp.E.mapLeft(
            (errors): AIBotError =>
              DecodeError.of("Can't parse configuration", errors),
          ),
        ),
      ),
      fp.TE.map(
        (config): ConfigProvider<Schema.Schema.Encoded<C>> => ({
          config: config,
          save: (config) => ctx.fs.writeObject(path, JSON.stringify(config)),
        }),
      ),
    );
  };
