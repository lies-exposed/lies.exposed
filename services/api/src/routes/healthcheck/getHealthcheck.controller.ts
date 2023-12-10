import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGetHealthcheckRoute = (r: Router, ctx: RouteContext): void => {
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
