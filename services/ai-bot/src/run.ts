import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { loadContext } from "./load-context.js";
import { type ClientContextRTE } from "./types.js";
import { exponentialWait } from "./utils/exponentialWait.js";
import { report, toAIBotError } from "#common/error/index.js";
import { clearToken } from "#flows/clearToken.flow.js";
import { processOpenAIQueue } from "#flows/processOpenAIQueue.flow.js";
import { userLogin } from "#flows/userLogin.flow.js";

let token: string | null = null;

let waitForLoginRetry = 0;
const waitForLogin = (): ClientContextRTE<string> => {
  return pipe(
    userLogin(),
    fp.RTE.orElse(() =>
      pipe(
        exponentialWait(10000, waitForLoginRetry++, "login"),
        fp.RTE.chain(waitForLogin),
      ),
    ),
  );
};

let waitForLocalAIRetry = 0;
const waitForLocalAI = (): ClientContextRTE<void> => (ctx) => {
  return pipe(
    fp.TE.tryCatch(
      () =>
        ctx.openAI.client.models
          .list()
          .asResponse()
          .then((r) => r.json()),
      toAIBotError,
    ),
    fp.TE.orElse((e) => {
      ctx.logger.error.log("Error getting OpenAI models %O", e);

      return fp.TE.right({ data: [] });
    }),
    fp.TE.map((r) => r.data.map((m: { id: string }) => m.id)),
    LoggerService.TE.debug(ctx, "OpenAI models %O"),
    fp.TE.chain((models) => {
      if (models.length === 0) {
        return pipe(
          exponentialWait(10000, waitForLocalAIRetry++, "waitForLocalAI"),
          fp.RTE.chain(waitForLocalAI),
        )(ctx);
      }
      return fp.TE.right(undefined);
    }),
  );
};

const run = (dryRun: boolean): ClientContextRTE<void> => {
  const go = (retry: number): ClientContextRTE<void> =>
    pipe(
      processOpenAIQueue(dryRun),
      fp.RTE.fold(
        (e) => {
          if (e.status === 401) {
            return pipe(
              clearToken,
              fp.RTE.chain(() => run(dryRun)),
            );
          }
          return pipe(
            exponentialWait(10000, retry, "run:failed"),
            fp.RTE.chain(() => go(retry + 1)),
          );
        },
        () =>
          pipe(
            exponentialWait(10000, 0, "run:finish"),
            fp.RTE.chain(() => go(0)),
          ),
      ),
    );

  return pipe(
    waitForLogin(),
    fp.RTE.map((t) => {
      token = t;
      return token;
    }),
    fp.RTE.chainFirst(waitForLocalAI),
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
