/* eslint-disable @typescript-eslint/naming-convention */
import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import { formatISO } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Eq from "fp-ts/lib/Eq";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { VaccineEntry } from "../types";
import { computeTotals, reduceToDateEntry } from "../utils/parse.utils";

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

export const orderAndGroup = (data: VaccineEntry[]): VaccineEntry[] => {
  logger.debug.log("Sort, group by date and reduce (%d)", data.length);
  return pipe(
    data,
    A.sort(Ord.contramap<Date, VaccineEntry>((d) => d.date)(D.Ord)),
    groupBy(Eq.contramap<Date, VaccineEntry>((d) => d.date)(D.eqDate)),
    A.reduce([] as VaccineEntry[], (acc, v) => {
      return acc.concat(reduceToDateEntry(v[0], A.takeRight(v.length - 1)(v)));
    })
  );
};

export const reduceToReport = (data: VaccineEntry[][]): VaccineEntry[] => {
  logger.debug.log("Reducing nested results (%d)", data.length);
  return data.reduce<VaccineEntry[]>((acc, v) => {
    logger.debug.log(
      "Combine accumulated results (%d) with other entries (%d)",
      acc.length,
      v.length
    );
    return orderAndGroup([...acc, ...v]);
  }, []);
};

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

  return {
    deaths: injuries.death,
    death_0_1_month: is01Month ? injuries.death : 0,
    death_2_month_2_years: is2Months2Years ? injuries.death : 0,
    death_3_11_years: is3To12Years ? injuries.death : 0,
    death_12_17_years: is12To17Years ? injuries.death : 0,
    death_18_64_years: is18To64Years ? injuries.death : 0,
    death_65_85_years: is65To85Years ? injuries.death : 0,
    death_more_than_85_years: isMoreThan85Years ? injuries.death : 0,
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

  logger.debug.log("Importing vaccine data for date %s", importPath);

  const MakeManufacturerReportTask = (
    paths: string[],
    outputFileName: string
  ): TE.TaskEither<Error, void> => {
    return pipe(
      A.sequence(TE.ApplicativePar)(
        paths.map((s) =>
          pipe(
            TE.fromIO<string, Error>(() => fs.readFileSync(s, "utf-8")),
            TE.chain((content) => csvUtil.parseString(content, EUDRVIGILANCE)),
            TE.map(A.map(parseEUDRVigilanceDatum)),
            TE.map(orderAndGroup)
          )
        )
      ),
      TE.map((results) => reduceToReport(results)),
      TE.map((results) => computeTotals(results)),
      TE.chain((results) =>
        csvUtil.writeToPath(
          path.resolve(importPath, outputFileName),
          results.map(({ date, ...r }) => ({
            date: formatISO(date, { representation: "date" }),
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

  logger.debug.log("CSV to process %O", csvPaths);

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
        "moderna.csv"
      ),
      EUDRVIGILANCE_PFIZER_2020: MakeManufacturerReportTask(
        paths.pfizer,
        "pfizer.csv"
      ),
      EUDRVIGILANCE_ASTRAZENECA: MakeManufacturerReportTask(
        paths.astrazeneca,
        "astrazeneca.csv"
      ),
      EUDRVIGILANCE_JANSSEN: MakeManufacturerReportTask(
        paths.janssen,
        "janssen.csv"
      ),
    }),
    TE.map(() => undefined)
  );
};

export const runTotalsReport = (): TE.TaskEither<Error, void> => {
  const logger = GetLogger("vaccine-aggregate-report-data");
  const csvUtil = GetCSVUtil({ log: logger });
  const resultOutDir = path.resolve(
    __dirname,
    "../../../public/covid19/vaccines/eudr"
  );
  logger.debug.log("Importing vaccine data...");

  const makeTotalTask = (
    readPaths: string[],
    outputFileName: string
  ): TE.TaskEither<Error, void> =>
    pipe(
      A.sequence(TE.ApplicativeSeq)(
        readPaths.map((p) => {
          const csvPath = path.resolve(resultOutDir, p);
          logger.debug.log(
            "Reading data from %s... exists? (%s)",
            csvPath,
            fs.existsSync(csvPath)
          );

          return pipe(
            TE.fromIO<string, Error>(() =>
              fs.readFileSync(csvPath, { encoding: "utf-8" })
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
            // TE.map((data) => orderAndGroup(data))
          );
        })
      ),
      TE.map((results) => computeTotals(reduceToReport(results))),
      TE.chain((results) =>
        csvUtil.writeToPath(
          path.resolve(resultOutDir, outputFileName),
          results.map(({ date, ...r }) => ({
            date: formatISO(date, { representation: "date" }),
            ...r,
          }))
        )
      )
    );

  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      EUDRVIGILANCE: makeTotalTask(
        ["moderna.csv", "pfizer.csv", "astrazeneca.csv", "janssen.csv"],
        "eudrvigilance.csv"
      ),
    }),
    TE.map(() => undefined)
  );
};
