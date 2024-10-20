import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { toAPIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { pipe } from "fp-ts/lib/function.js";
import prompts from "prompts";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "./types.js";
import { type ApiBotError, toApiBotError } from "#common/error/index.js";

const tokenFilePath = path.resolve(process.cwd(), "temp/.token");

export const userLogin = (): ClientContextRTE<string> => {
  return pipe(
    getOlderThanOr(
      tokenFilePath,
      10,
    )<string, ApiBotError, ClientContext>(
      pipe(
        fp.RTE.Do,
        fp.RTE.apS(
          "username",
          pipe(
            fp.RTE.ask<ClientContext>(),
            fp.RTE.flatMapOption<ClientContext, string, ApiBotError>(
              (ctx) => ctx.env.LIEXP_USERNAME,
              () => toApiBotError("LIEXP_USERNAME not set"),
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
                fp.RTE.fromTaskEither<ApiBotError, string, ClientContext>,
              ),
            ),
          ),
        ),
        fp.RTE.bind("password", ({ username }) =>
          pipe(
            fp.RTE.ask<ClientContext>(),
            fp.RTE.flatMapOption<ClientContext, string, ApiBotError>(
              (ctx) => ctx.env.LIEXP_PASSWORD,
              () => toApiBotError("LIEXP_USERNAME not set"),
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
                fp.RTE.fromTaskEither<ApiBotError, string, ClientContext>,
              ),
            ),
          ),
        ),
        fp.RTE.chain(
          ({ username, password }) =>
            (ctx: ClientContext) =>
              pipe(
                ctx.endpointsRESTClient.Endpoints.User.Custom.UserLogin({
                  Body: {
                    username: username,
                    password: password,
                  },
                }),
                fp.TE.mapLeft(toAPIError),
              ),
        ),
        LoggerService.RTE.debug("User logged in %O"),
        fp.RTE.mapLeft(toAPIError),
        fp.RTE.map((m) => m.data.token),
      ),
    ),
  );
};
