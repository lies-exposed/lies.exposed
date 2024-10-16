import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import prompts from "prompts";
import { loadContext } from "#context/load.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOlderThanOr } from "#flows/fs/getOlderThanOr.flow.js";
import { LoggerService } from "#flows/logger/logger.service.js";
import { toControllerError } from "#io/ControllerError.js";
const tokenFilePath = path.resolve(process.cwd(), "temp/.token");

let token: string | null = null;

const restClient = APIRESTClient({
  getAuth: () => {
    return token;
  },
  url: "http://api.liexp.dev/v1/",
});
const apiClient = fromEndpoints(restClient)(Endpoints);

const run: TEReader<void> = (ctx) => {
  return pipe(
    getOlderThanOr(
      tokenFilePath,
      10,
    )((ctx) =>
      pipe(
        fp.TE.Do,
        fp.TE.bind("username", () =>
          fp.TE.tryCatch(
            async () =>
              prompts({
                message: "Select a user",
                type: "text",
                name: "username",
              }),
            toControllerError,
          ),
        ),
        fp.TE.bind("password", ({ username }) =>
          fp.TE.tryCatch(
            async () =>
              prompts({
                message: `Enter password for ${username.username}`,
                type: "password",
                name: "password",
              }),
            toControllerError,
          ),
        ),
        fp.TE.chain(({ username, password }) =>
          apiClient.Endpoints.User.Custom.UserLogin({
            Body: {
              username: username.username,
              password: password.password,
            },
          }),
        ),
        LoggerService.TE.debug(ctx, "User logged in %O"),
        fp.TE.mapLeft(toControllerError),
        fp.TE.map((m) => m.data.token),
      ),
    )(ctx),
    fp.TE.map((t) => {
      token = t;
      return token;
    }),
    fp.TE.chain(() =>
      apiClient.Endpoints.Queues.getList({
        filter: {
          resource: undefined,
          type: undefined,
        },
      }),
    ),
    fp.TE.mapLeft(toControllerError),
    fp.TE.map((m) => {
      ctx.logger.debug.log("Queue fetched %O", m);
      return undefined;
    }),
  );
};

void pipe(loadContext(), fp.TE.chain(run), throwTE)
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
