import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { getApiToken } from "./flows/getApiToken.flow.js";
import { loadContext } from "./load-context.js";
import { type ClientContextRTE } from "./types.js";
import { exponentialWait } from "./utils/exponentialWait.js";
import { report } from "#common/error/index.js";
import { processOpenAIQueue } from "#flows/processOpenAIQueue.flow.js";

let token: string | null = null;

const exponentialWaitOneMinute = exponentialWait(60000);

let waitForAgentRetry = 0;
const waitForAgent = (): ClientContextRTE<void> => (ctx) => {
  return pipe(
    // Check agent service health by listing conversations
    ctx.agent.Chat.List({ Query: { limit: "1", offset: "0" } }),
    fp.TE.fold(
      (e) => {
        ctx.logger.error.log("Error connecting to agent service %O", e);
        return pipe(
          exponentialWaitOneMinute(10000, waitForAgentRetry++, "waitForAgent"),
          fp.RTE.chain(waitForAgent),
        )(ctx);
      },
      () => {
        ctx.logger.info.log("Agent service is ready");
        return fp.TE.right(undefined);
      },
    ),
  );
};

const run = (dryRun: boolean): ClientContextRTE<void> => {
  const go = (retry: number): ClientContextRTE<void> =>
    pipe(
      processOpenAIQueue(dryRun),
      fp.RTE.fold(
        (e) => {
          if (e.status === 401) {
            // With API token auth, a 401 means the token is invalid/expired
            // Log error and retry with exponential backoff
            return pipe(
              exponentialWaitOneMinute(10000, retry, "auth:401"),
              fp.RTE.chain(() => go(retry + 1)),
            );
          }
          return pipe(
            exponentialWaitOneMinute(10000, retry, "run:failed"),
            fp.RTE.chain(() => go(retry + 1)),
          );
        },
        () =>
          pipe(
            exponentialWaitOneMinute(10000, 0, "run:finish"),
            fp.RTE.chain(() => go(0)),
          ),
      ),
    );

  return pipe(
    getApiToken(),
    fp.RTE.map((t) => {
      token = t;
      return token;
    }),
    fp.RTE.chainFirst(waitForAgent),
    fp.RTE.chain(() => go(0)),
  );
};

const dryRun = false;

void pipe(
  loadContext(() => token),
  fp.TE.chain(run(dryRun)),
  fp.TE.mapLeft(report),
  throwTE,
)
  .then((r) => {
    // eslint-disable-next-line no-console
    console.log("Success", r);
    process.exit(0);
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.error(e);
    process.exit(1);
  });
