import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "../types.js";
import { toAIBotError } from "#common/error/index.js";

export const getApiToken = (): ClientContextRTE<string> => {
  return pipe(
    fp.RTE.ask<ClientContext>(),
    fp.RTE.chainTaskEitherK((ctx) => {
      return pipe(
        ctx.env.API_TOKEN,
        fp.O.fold(
          () =>
            fp.TE.left(
              toAIBotError(
                "API_TOKEN environment variable is required but not set",
              ),
            ),
          (token) => {
            ctx.logger.debug.log("Using API_TOKEN from environment");
            return fp.TE.right(token);
          },
        ),
      );
    }),
  );
};
