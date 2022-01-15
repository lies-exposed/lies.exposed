import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export const MakeGetMetadataRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.OpenGraph.Custom.GetMetadata,
    ({ query: { url } }) => {
      return pipe(
        ctx.urlMetadata.fetchMetadata(url, (e) => {
          ctx.logger.error.log("Error fetching data %O", e);
          return ServerError();
        }),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
