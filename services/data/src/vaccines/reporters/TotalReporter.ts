import * as fs from "fs";
import { GetLogger } from "@liexp/core/logger";
import { VaccineDatum } from "@liexp/shared/io/http/covid/VaccineDatum";
import { GetCSVUtil } from "@liexp/shared/utils/csv.utils";
import { distanceFromNow } from "@liexp/shared/utils/date";
import * as A from "fp-ts/Array";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
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
