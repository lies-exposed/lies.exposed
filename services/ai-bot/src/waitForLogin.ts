import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { getTokenOrLogin } from "./flows/userLogin.flow.js";
import { exponentialWaitOneMinute } from "./run.js";
import type { ClientContextRTE } from "./types.js";

export const waitForToken = (): ClientContextRTE<string> => {
  const loop = (retry: number): ClientContextRTE<string> => {
    return pipe(
      getTokenOrLogin(),
      fp.RTE.orElse(() =>
        pipe(
          exponentialWaitOneMinute(10000, retry, "login"),
          fp.RTE.chain(() => loop(retry++)),
        ),
      ),
    );
  };
  return loop(0);
};
