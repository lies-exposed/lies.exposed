import * as fs from "fs";
import { GetLogger } from "@liexp/core/lib/logger";
import { VaccineDatum } from "@liexp/shared/lib/io/http/covid/VaccineDatum";
import { GetCSVUtil } from "@liexp/shared/lib/utilstils/csv.utils";
import { distanceFromNow } from "@liexp/shared/lib/utilstils/date";
import * as A from "fp-ts/lib/Array.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { computeTotals, ReportReducer } from "../utils/parse.utils";

interface TotalReporterOpts {
  importPaths: string[];
  outputFile: string;
}

export const TotalsReporter = ({
  importPaths,
  outputFile,
}: TotalReporterOpts): TE.TaskEither<Error, void> => {
  const logger = GetLogger("vaccines-totals-reporter");
  const csvUtil = GetCSVUtil({ log: logger });

  const reduceToReport = ReportReducer(logger);

  return pipe(
    A.sequence(TE.ApplicativeSeq)(
      importPaths.map((p) => {
        logger.debug.log(
          "Reading data from %s... exists? (%s)",
          p,
          fs.existsSync(p)
        );

        return pipe(
          TE.fromIOEither<Error, string>(
            IOE.fromIO(() => fs.readFileSync(p, { encoding: "utf-8" }))
          ),
          TE.chain((content) =>
            csvUtil.parseString(
              content,
              VaccineDatum,
              ({ date, ...r }: any) => ({
                date: new Date(date).toISOString(),
                ...r,
              })
            )
          )
        );
      })
    ),
    TE.map((results) => computeTotals(reduceToReport(results))),
    TE.chain((results) =>
      csvUtil.writeToPath(
        outputFile,
        results.map(({ date, ...r }) => ({
          date: distanceFromNow(date),
          ...r,
        }))
      )
    )
  );
};
