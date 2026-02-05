import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetHealthcheckRoute: Route = (r, _ctx) => {
  AddEndpoint(r)(Endpoints.Healthcheck.List, () => {
    return pipe(
      TE.right({
        status: "OK",
        version: process.env.VERSION ?? "0.0.0",
        commitHash: process.env.COMMIT_HASH ?? "unknown",
      }),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
