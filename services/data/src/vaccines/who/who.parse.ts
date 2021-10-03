/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { WHOCovid19GlobalData } from "@econnessione/shared/io/http/covid/COVIDDailyDatum";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import { formatISO } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Eq from "fp-ts/lib/Eq";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

const WHO_DATA_RESULT_DIR = path.resolve(
  __dirname,
  "../../../public/covid19/who"
);
const WHO_DATA_IMPORT_DIR = path.resolve(WHO_DATA_RESULT_DIR, "import");

export const reduceToDateEntry = (
  init: WHOCovid19GlobalData,
  rest: WHOCovid19GlobalData[]
): WHOCovid19GlobalData => {
  return pipe(
    rest,
    A.reduce(init, (acc, v) => {
      return {
        Country: "World",
        Country_code: "World",
        Date_reported: v.Date_reported,
        WHO_region: "World",
        New_cases: acc.New_cases + v.New_cases,
        Cumulative_cases: acc.Cumulative_cases + v.Cumulative_cases,
        New_deaths: acc.New_deaths + v.New_deaths,
        Cumulative_deaths: acc.Cumulative_deaths + v.Cumulative_deaths,
      };
    })
  );
};

const sortByDate = pipe(
  D.Ord,
  Ord.contramap<Date, WHOCovid19GlobalData>((d) => new Date(d.Date_reported))
);

const eqVaccineDate = pipe(
  D.eqDate,
  Eq.contramap<Date, WHOCovid19GlobalData>((d) => new Date(d.Date_reported))
);

export const mergeByDate = (
  data: NEA.NonEmptyArray<WHOCovid19GlobalData>
): NEA.NonEmptyArray<WHOCovid19GlobalData> => {
  return pipe(
    data,
    NEA.sort(sortByDate),
    NEA.group(eqVaccineDate),
    A.reduce(
      [] as any as NEA.NonEmptyArray<WHOCovid19GlobalData>,
      (acc, entriesByDate) => {
        const [init, ...rest] = entriesByDate;
        return NEA.concat([reduceToDateEntry(init, rest)])(acc);
      }
    )
  );
};

export const runTotals = (): TE.TaskEither<Error, void> => {
  const log = GetLogger("who-global-data-totals");
  const csvFile = path.resolve(
    WHO_DATA_IMPORT_DIR,
    "who-covid-19-global-data.csv"
  );
  const outputFile = path.resolve(
    WHO_DATA_RESULT_DIR,
    "who-covid-19-world-data.csv"
  );
  const csvUtils = GetCSVUtil({ log });

  return pipe(
    csvUtils.parseFile(
      csvFile,
      { headers: true, ignoreEmpty: true },
      {
        decoder: WHOCovid19GlobalData,
        mapper: (v: any) => ({
          ...v,
          Date_reported: new Date(v.Date_reported).toISOString(),
        }),
      }
    ),
    TE.map((results) =>
      pipe(
        results,
        NEA.fromArray,
        O.map(mergeByDate),
        O.getOrElse((): WHOCovid19GlobalData[] => [])
      )
    ),
    TE.chain((results) =>
      csvUtils.writeToPath(
        outputFile,
        results.map(({ Date_reported, ...rest }) => ({
          Date_reported: formatISO(Date_reported, { representation: "date" }),
          ...rest,
        }))
      )
    )
  );
};
