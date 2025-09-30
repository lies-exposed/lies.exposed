import { readFileSync } from "fs";
import * as path from "path";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { toAPIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type AIBotConfigContext,
  type APIClientContext,
  type ENVContext,
} from "../context.js";
import { type AIBotError, toAIBotError } from "#common/error/index.js";

const tokenFilePath = path.resolve(process.cwd(), "temp/.token");

export const currentToken = (): string => {
  return readFileSync(tokenFilePath, "utf-8");
};

export const userLogin = <
  C extends FSClientContext &
    APIClientContext &
    ENVContext &
    LoggerContext &
    AIBotConfigContext,
>(): ReaderTaskEither<C, AIBotError, string> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompts", () =>
      pipe(
        fp.TE.tryCatch(() => import("prompts"), toAPIError),
        fp.RTE.fromTaskEither,
      ),
    ),
    fp.RTE.bind("username", ({ prompts }) =>
      pipe(
        fp.RTE.ask<C>(),
        fp.RTE.flatMapOption<C, string, AIBotError>(
          (ctx) => ctx.env.LIEXP_USERNAME,
          () => toAIBotError("LIEXP_USERNAME not set"),
        ),
        fp.RTE.orElse(() =>
          pipe(
            fp.TE.tryCatch(
              async () =>
                prompts({
                  message: "Select a user",
                  type: "text",
                  name: "username",
                }),
              toAPIError,
            ),
            fp.TE.map((m) => m.username),
            fp.RTE.fromTaskEither<AIBotError, string, C>,
          ),
        ),
      ),
    ),
    fp.RTE.bind("password", ({ username, prompts }) =>
      pipe(
        fp.RTE.ask<C>(),
        fp.RTE.flatMapOption<C, string, AIBotError>(
          (ctx) => ctx.env.LIEXP_PASSWORD,
          () => toAIBotError("LIEXP_PASSWORD not set"),
        ),
        fp.RTE.orElse(() =>
          pipe(
            fp.TE.tryCatch(
              async () =>
                prompts({
                  message: `Enter password for ${username}`,
                  type: "password",
                  name: "password",
                }),
              toAPIError,
            ),
            fp.TE.map((m) => m.password),
            fp.RTE.fromTaskEither<AIBotError, string, C>,
          ),
        ),
      ),
    ),
    fp.RTE.chain(
      ({ username, password }) =>
        (ctx: C) =>
          pipe(
            ctx.api.User.Custom.UserLogin({
              Body: {
                username: username,
                password: password,
              },
            }),
            fp.TE.mapLeft(toAIBotError),
          ),
    ),
    LoggerService.RTE.debug("User logged in %O"),
    fp.RTE.map((m) => m.data.token),
    fp.RTE.chainFirst(
      (token) => (ctx) =>
        pipe(
          ctx.fs.writeObject(tokenFilePath, `"${token}"`),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
  );
};

export const getTokenOrLogin = () => {
  return pipe(getOlderThanOr(tokenFilePath, 10)(userLogin()));
};
