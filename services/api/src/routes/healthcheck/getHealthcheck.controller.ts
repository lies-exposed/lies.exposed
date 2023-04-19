import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "@routes/route.types";

export const MakeGetHealthcheckRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Healthcheck.List, () => {
    return pipe(
      TE.right({ status: "OK" }),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
