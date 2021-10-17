import { AddEndpoint, Graph } from "@econnessione/shared/endpoints";
// import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
// import { VaccineDistributionDatum } from "@econnessione/shared/io/http/covid/VaccineDistributionDatum";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { NotFoundError, ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

// const getDecoderById = (
//   id: Graph.GraphId
// ): [t.Type<any, unknown>, (a: any) => any] => {
//   switch (id) {
//     case "covid19/vaccines/distribution/world-distribution.csv":
//       return [VaccineDistributionDatum, t.identity];
//     case "covid19/vaccines/eudr/results/eudrvigilance-moderna.csv":
//     case "covid19/vaccines/eudr/results/eudrvigilance-pfizer-2021.csv":
//       return [
//         VaccineDatum,
//         (r): VaccineDatum => ({
//           ...r,
//           // reported: parseInt(r.reported, 10),
//           // deaths: parseInt(r.deaths, 10),
//           // injuries: parseInt(r.injuries, 10),
//           // cumulativeInjuries: parseInt(r.cumulativeInjuries, 10),
//           // cumulativeDeaths: parseInt(r.cumulativeDeaths, 10),
//           // cumulativeReported: parseInt(r.cumulativeReported, 10)

//         }),
//       ];
//     default:
//       return [t.any, t.identity];
//   }
// };

export const MakeGraphsRoute = (r: Router, ctx: RouteContext): void => {
  const csvUtil = GetCSVUtil({ log: ctx.logger });
  AddEndpoint(r)(Graph.GetGraph, ({ query: { id } }) => {
    ctx.logger.debug.log("Fetching data from %s", id);
    return pipe(
      ctx.s3.getObject({ Key: id, Bucket: ctx.env.SPACE_BUCKET }),
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
