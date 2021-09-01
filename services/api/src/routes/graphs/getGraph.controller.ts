import * as fs from "fs";
import * as path from "path";
import { AddEndpoint, Graph } from "@econnessione/shared/endpoints";
// import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
// import { VaccineDistributionDatum } from "@econnessione/shared/io/http/covid/VaccineDistributionDatum";
import { RouteContext } from "@routes/route.types";
import { GetCSVUtil } from "@utils/csv.utils";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { IOError } from "ts-shared/lib/errors";

const DATA_FOLDER = path.resolve(process.cwd(), "data");

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

const readFile = (id: string): TE.TaskEither<Error, string> => {
  const graphPath = path.resolve(DATA_FOLDER, id);
  return TE.fromIOEither(
    IOE.tryCatch(
      () =>
        fs
          .readFileSync(graphPath, {
            encoding: "utf-8",
          })
          .toString(),
      E.toError
    )
  );
};

export const MakeGraphsRoute = (r: Router, ctx: RouteContext): void => {
  const csvUtil = GetCSVUtil({ log: ctx.logger });
  AddEndpoint(r)(Graph.GetGraph, ({ query: { id } }) => {
    return pipe(
      readFile(id),
      TE.chain((content) => csvUtil.parseString(content, t.any)),
      TE.mapLeft(
        (e) =>
          new IOError(`Can't read file at ${id}`, {
            kind: "ServerError",
            status: "500",
            meta: e,
          })
      ),
      TE.map((data) => ({
        body: {
          data: data,
        },
        statusCode: 200,
      }))
    );
  });
};
