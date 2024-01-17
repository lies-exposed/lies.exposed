/* eslint-disable @typescript-eslint/naming-convention */
import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger";
import { GetCSVUtil } from "@liexp/shared/lib/utils/csv.utils";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { TotalsReporter } from "../reporters/TotalReporter";
import { VaccineEntry } from "../types";
import {
  computeTotals,
  mergeByDate,
  ReportReducer,
} from "../utils/parse.utils";

const logger = GetLogger("vaccines:parse");
const csvUtil = GetCSVUtil({ log: logger });

const EUDRVIGILANCE = t.strict(
  {
    "EU Local Number": t.union([t.undefined, t.string]),
    "Report Type": t.string,
    "EV Gateway Receipt Date": t.string,
    "Primary Source Qualification": t.string,
    "Primary Source Country for Regulatory Purposes": t.string,
    "Literature Reference": t.string,
    "Patient Age Group": t.string,
    "Patient Age Group (as per reporter)": t.string,
    "Parent Child Report": t.string,
    "Patient Sex": t.string,
    "Reaction List PT (Duration – Outcome - Seriousness Criteria)": t.string,
    "Suspect/interacting Drug List (Drug Char - Indication PT - Action taken - [Duration - Dose - Route])":
      t.string,
    "Concomitant/Not Administered Drug List (Drug Char - Indication PT - Action taken - [Duration - Dose - Route])":
      t.string,
    "ICSR Form": t.string,
  },
  "EUDRVIGILANCE"
);

type EUDRVIGILANCE = t.TypeOf<typeof EUDRVIGILANCE>;

const insideParenthesis = /\(([^)]+)\)/;

interface Injury {
  label: string;
  duration?: string;
  outcome?: string;
  seriousness?: string[];
}
const parseEUDRVigilanceDatum = (v: EUDRVIGILANCE): VaccineEntry => {
  const injuriesList: Injury[] = v[
    "Reaction List PT (Duration – Outcome - Seriousness Criteria)"
  ]
    .split("<BR><BR>")
    .filter((s) => s !== "")
    .map((s) => {
      const match = s.match(insideParenthesis);
      if (!match) {
        return { label: s };
      }
      const [duration, outcome, seriousness] = match[1].split(" - ");
      return {
        label: s,
        duration,
        outcome,
        seriousness: seriousness ? seriousness.split(",") : [],
      };
    });

  const injuries = injuriesList.reduce(
    (acc, s) => {
      const death =
        acc.death +
        (s.label.startsWith("Death") ||
        !!s.outcome?.includes("Fatal") ||
        !!s.seriousness?.some((s) => s.includes("Results in Death"))
          ? 1
          : 0);

      const severe = acc.severe + (s.seriousness?.length ?? 0);
      return { death, severe };
    },
    { death: 0, severe: 0 }
  );

  const patientAgeGroup = v["Patient Age Group"];
  const is01Month = patientAgeGroup === "0-1 Month";
  const is2Months2Years = patientAgeGroup === "2 Months - 2 Years";
  const is3To12Years = patientAgeGroup === "3-11 Years";
  const is12To17Years = patientAgeGroup === "12-17 Years";
  const is18To64Years = patientAgeGroup === "18-64 Years";
  const is65To85Years = patientAgeGroup === "65-85 Years";
  const isMoreThan85Years = patientAgeGroup === "More than 85 Years";
  const isYearsNotSpecified =
    !is01Month &&
    !is2Months2Years &&
    !is3To12Years &&
    !is12To17Years &&
    !is18To64Years &&
    !is65To85Years &&
    !isMoreThan85Years;

  return {
    deaths: injuries.death,
    death_0_1_month: is01Month ? injuries.death : 0,
    death_2_month_2_years: is2Months2Years ? injuries.death : 0,
    death_3_11_years: is3To12Years ? injuries.death : 0,
    death_12_17_years: is12To17Years ? injuries.death : 0,
    death_18_64_years: is18To64Years ? injuries.death : 0,
    death_65_85_years: is65To85Years ? injuries.death : 0,
    death_more_than_85_years: isMoreThan85Years ? injuries.death : 0,
    death_years_not_specified: isYearsNotSpecified ? injuries.death : 0,
    reported: 1,
    date: new Date(v["EV Gateway Receipt Date"].split(" ")[0]) ?? new Date(),
    severe: injuries.severe,
    injuries: injuriesList.length,
  };
};

export const runManufacturerReport = (): TE.TaskEither<Error, void> => {
  const outputPath = path.resolve(
    __dirname,
    "../../../public/covid19/vaccines/eudr"
  );
  const importPath = path.resolve(outputPath, "import");

  const reduceToReport = ReportReducer(logger);

  const MakeManufacturerReportTask = (
    paths: string[],
    outputFileName: string
  ): TE.TaskEither<Error, void> => {
    logger.debug.log("CSV to process %O", paths);

    return pipe(
      A.sequence(TE.ApplicativePar)(
        paths.map((s) =>
          pipe(
            TE.fromIO<string, Error>(() => fs.readFileSync(s, "utf-8")),
            TE.chain((content) => csvUtil.parseString(content, EUDRVIGILANCE)),
            TE.map(A.map(parseEUDRVigilanceDatum)),
            TE.map(mergeByDate)
          )
        )
      ),
      TE.map((results) => reduceToReport(results)),
      TE.map((results) => computeTotals(results)),
      TE.chain((results) =>
        csvUtil.writeToPath(
          outputFileName,
          results.map(({ date, ...r }) => ({
            date: distanceFromNow(date),
            ...r,
          }))
        )
      )
    );
  };

  const csvPaths = fs
    .readdirSync(path.resolve(importPath))
    .filter((v) => v.includes(".csv"))
    .map((v) => path.resolve(importPath, v));

  const paths = csvPaths.reduce(
    (acc, v) => {
      return {
        ...acc,
        moderna: v.includes("moderna") ? acc.moderna.concat(v) : acc.moderna,
        pfizer: v.includes("pfizer") ? acc.pfizer.concat(v) : acc.pfizer,
        astrazeneca: v.includes("astrazeneca")
          ? acc.astrazeneca.concat(v)
          : acc.astrazeneca,
        janssen: v.includes("janssen") ? acc.janssen.concat(v) : acc.janssen,
      };
    },
    {
      janssen: [] as string[],
      moderna: [] as string[],
      pfizer: [] as string[],
      astrazeneca: [] as string[],
    }
  );

  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      EUDRVIGILANCE_MODERNA: MakeManufacturerReportTask(
        paths.moderna,
        path.resolve(EUDR_OUTPUT_DIR, "moderna.csv")
      ),
      EUDRVIGILANCE_PFIZER_2020: MakeManufacturerReportTask(
        paths.pfizer,
        path.resolve(EUDR_OUTPUT_DIR, "pfizer.csv")
      ),
      EUDRVIGILANCE_ASTRAZENECA: MakeManufacturerReportTask(
        paths.astrazeneca,
        path.resolve(EUDR_OUTPUT_DIR, "astrazeneca.csv")
      ),
      EUDRVIGILANCE_JANSSEN: MakeManufacturerReportTask(
        paths.janssen,
        path.resolve(EUDR_OUTPUT_DIR, "janssen.csv")
      ),
    }),
    TE.map(() => undefined)
  );
};

export const EUDR_OUTPUT_DIR = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/eudr"
);

export const runTotalsReport = TotalsReporter({
  importPaths: [
    "moderna.csv",
    "pfizer.csv",
    "astrazeneca.csv",
    "janssen.csv",
  ].map((f) => path.resolve(EUDR_OUTPUT_DIR, f)),
  outputFile: path.resolve(EUDR_OUTPUT_DIR, "eudrvigilance.csv"),
});
