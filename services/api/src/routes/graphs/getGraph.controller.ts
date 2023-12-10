import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Graph } from "@liexp/shared/lib/endpoints/index.js";
import { GetCSVUtil } from "@liexp/shared/lib/utils/csv.utils.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { NotFoundError, ServerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGetGraphsRoute = (r: Router, ctx: RouteContext): void => {
  const csvUtil = GetCSVUtil({ log: ctx.logger });
  AddEndpoint(r)(Graph.GetGraph, ({ query: { id } }) => {
    ctx.logger.debug.log("Fetching data from %s", id);
    return pipe(
      ctx.s3.getObject({ Key: `public/${id}`, Bucket: ctx.env.SPACE_BUCKET }),
      TE.chain((content) => {
        if (content.Body) {
          return pipe(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            csvUtil.parseString(content.Body.toString(), t.any),
            TE.mapLeft(() => ServerError()),
          );
        }
        return TE.left(NotFoundError("graph"));
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
