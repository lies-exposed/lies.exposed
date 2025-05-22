import { fp } from "@liexp/core/lib/fp/index.js";
import { toAIBotError } from "../common/error/index.js";
import type { ClientContextRTE } from "../types.js";

export const exponentialWait =
  (maxDelay: number = Infinity) =>
  (delay: number, retries: number, action: string): ClientContextRTE<void> =>
  (ctx) => {
    const newDelay = Math.min(maxDelay, delay * Math.pow(2, retries));

    return fp.TE.tryCatch(() => {
      ctx.logger.debug.log(
        "Retrying (%d) %s in %ds",
        retries,
        action,
        newDelay / 1000,
      );
      return new Promise((resolve) => setTimeout(resolve, newDelay));
    }, toAIBotError);
  };
