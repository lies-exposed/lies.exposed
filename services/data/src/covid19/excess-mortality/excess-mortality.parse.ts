import * as path from "path";
import * as logger from "@econnessione/core/logger";
import { COVID19ExcessMortalityDatum } from "@econnessione/shared/io/http/covid/COVID19ExcessMortalityDatum";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

const csvUtil = GetCSVUtil({ log: logger.GetLogger("csv-util") });
const outputPath = path.resolve(
  process.cwd(),
  "public/covid19/excess_mortality"
);
const importPath = path.resolve(outputPath, "import");
const filePath = path.resolve(importPath, "excess_mortality.csv");
const outputFile = path.resolve(outputPath, "excess_mortality.csv");
const run = () => {
  return pipe(
    csvUtil.parseFile(
      filePath,
      { headers: true, rtrim: true, ignoreEmpty: true },
      {
        decoder: COVID19ExcessMortalityDatum,
        mapper: (datum) => {
          return pipe(
            datum as Record<string, any>,
            R.map((v) => (v === "" ? undefined : v))
          ) as COVID19ExcessMortalityDatum;
        },
      }
    ),
    TE.chain((data) => {
      return csvUtil.writeToPath(
        outputFile,
        data.map(({ location, date, time_unit, ...options }) => ({
          location,
          date: new Date(date).toISOString(),
          time_unit,
          ...R.compact({ ...options }),
        }))
      );
    })
  );
};

// eslint-disable-next-line no-console
run()().then(console.log).catch(console.error);
