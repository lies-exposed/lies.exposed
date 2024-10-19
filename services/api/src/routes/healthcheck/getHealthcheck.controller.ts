import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetHealthcheckRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Healthcheck.List, () => {
    return pipe(
      TE.right({ status: "OK" }),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
