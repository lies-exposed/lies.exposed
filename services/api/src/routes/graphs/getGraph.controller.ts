import { AddEndpoint } from "@liexp/shared/endpoints";
// import { VaccineDatum } from "@liexp/shared/io/http/covid/VaccineDatum";
// import { VaccineDistributionDatum } from "@liexp/shared/io/http/covid/VaccineDistributionDatum";
import { GetCSVUtil } from "@liexp/shared/utils/csv.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NotFoundError, ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const MakeGraphsRoute = (r: Router, ctx: RouteContext): void => {
  const csvUtil = GetCSVUtil({ log: ctx.logger });
  AddEndpoint(r)(Endpoints.Graph.Get, ({ query: { id } }) => {
    ctx.logger.debug.log("Fetching data from %s", id);
    return pipe(
      ctx.s3.getObject({ Key: `public/${id}`, Bucket: ctx.env.SPACE_BUCKET }),
      TE.chain((content) => {
        if (content.Body) {
          return pipe(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            csvUtil.parseString(content.Body.toString(), t.any),
            TE.mapLeft(() => ServerError())
          );
        }
        return TE.left(NotFoundError("graph"));
      }),
      TE.map((data) => ({
        body: {
          data: data,
        },
        statusCode: 200,
      }))
    );
  });
};
