import * as fs from "fs";
import * as path from "path";
import { GetLogger, Logger } from "@econnessione/core/logger";
import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
import { groupBy } from "@utils/array.utils";
import { format } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as Eq from "fp-ts/lib/Eq";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { GetReadJSON, GetWriteJSON } from "../../../utils/json.utils";
import { parseCSV } from "../utils/parseCSV";

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

const VaccineEntry = t.strict(
  {
    date: DateFromISOString,
    deaths: t.number,
    reported: t.number,
    injuries: t.number,
    patientAgeGroup: t.string,
  },
  "VaccineEntry"
);
type VaccineEntry = t.TypeOf<typeof VaccineEntry>;

export const reduceToDayDatum = (results: VaccineEntry[]): VaccineEntry => {
  return pipe(
    results,
    A.reduce(
      {
        date: results[0].date,
        reported: 0,
        deaths: 0,
        injuries: 0,
        patientAgeGroup: "",
      },
      (acc, v) => {
        return {
          ...acc,
          ...v,
          reported: acc.reported + v.reported,
          deaths: acc.deaths + v.deaths,
          injuries: acc.injuries + v.injuries,
        };
      }
    )
  );
};

export const computeReportData =
  (log: Logger) =>
  (data: VaccineEntry[]): VaccineDatum[] => {
    log.debug.log(`Computing report (%d)`, data.length);
    log.debug.log(
      "Should have %d deaths",
      data.reduce((acc, d) => acc + d.deaths, 0)
    );

    return pipe(
      data,
      A.sort(Ord.contramap<Date, VaccineEntry>((d) => d.date)(D.Ord)),
      A.reduce(
        {
          date: new Date(),
          cumulativeDeaths: 0,
          cumulativeReported: 0,
          cumulativeInjuries: 0,
          results: [] as VaccineDatum[],
        },
        (acc, v) => {
          const cumulativeDeaths = acc.cumulativeDeaths + v.deaths;
          const cumulativeReported = acc.cumulativeReported + v.reported;
          const cumulativeInjuries = acc.cumulativeInjuries + v.injuries;
          const result = {
            ...v,
            cumulativeDeaths,
            cumulativeReported,
            cumulativeInjuries,
          };
          return {
            date: v.date,
            cumulativeDeaths,
            cumulativeInjuries,
            cumulativeReported,
            results: acc.results.concat(result),
          };
        }
      ),
      ({ results }) => results,
      groupBy(
        Eq.contramap<string, VaccineDatum>(
          (d) => d.date.toISOString().split("T")[0]
        )(Eq.eqStrict)
      ),
      A.reduce(
        {
          cumulativeDeaths: 0,
          cumulativeInjuries: 0,
          cumulativeReported: 0,
          results: [] as VaccineDatum[],
        },
        (acc, v) => {
          const dayDatum = reduceToDayDatum(v);
          const { cumulativeDeaths, cumulativeReported, cumulativeInjuries } =
            v[v.length - 1];
          const result = {
            ...dayDatum,
            cumulativeDeaths,
            cumulativeReported,
            cumulativeInjuries,
          };
          // log.debug.log(
          //   `Datum for date %s %O`,
          //   dayDatum.date.toLocaleDateString(),
          //   result
          // );

          return {
            cumulativeDeaths,
            cumulativeReported,
            cumulativeInjuries,
            results: acc.results.concat(result),
          };
        }
      ),
      ({ results }) => results
    );
  };

const processReportData =
  <A, O = A, I = unknown>(
    log: Logger,
    datum: t.Type<A, O, I>,
    mapper: (d: A) => VaccineEntry,
    outputDir: string
  ) =>
  (csvPaths: string[], outputPath: string): TE.TaskEither<Error, void> => {
    const writeJSON = GetWriteJSON(log);
    log.debug.log("Parsing csv from paths %O", csvPaths);
    return pipe(
      TE.sequenceSeqArray(csvPaths.map((s) => parseCSV(log)(s, datum))),
      TE.map((data) => data.reduce((acc, d) => acc.concat(d), [])),
      TE.map((data) =>
        pipe(
          data.map((v) => mapper(v)),
          (data) => computeReportData(log)(data)
        )
      ),
      TE.chain(writeJSON(path.resolve(outputDir, outputPath)))
    );
  };

const processAggregateReportData =
  (log: Logger, basePath: string) =>
  (readPaths: string[], filePath: string) => {
    const readJSON = GetReadJSON(log);
    const writeJSON = GetWriteJSON(log);
    return pipe(
      A.sequence(TE.ApplicativeSeq)(
        readPaths.map((p) =>
          readJSON(path.resolve(basePath, p), t.array(VaccineDatum))
        )
      ),
      TE.map(A.flatten),
      TE.map(computeReportData(log)),
      TE.chain(writeJSON(path.resolve(basePath, filePath)))
    );
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

  const isDead = injuriesList.reduce(
    (acc, s) =>
      !acc
        ? s.label.startsWith("Death") ||
          !!s.outcome?.includes("Fatal") ||
          !!s.seriousness?.some((s) => s.includes("Results in Death"))
        : acc,
    false
  );

  return {
    deaths: isDead ? 1 : 0,
    reported: 1,
    date: new Date(v["EV Gateway Receipt Date"].split(" ")[0]) ?? new Date(),
    patientAgeGroup: v["Patient Age Group"],
    injuries: injuriesList.length,
  };
};

export const runParse = (): TE.TaskEither<Error, void> => {
  const logger = GetLogger("vaccine-report-data");
  const now = new Date();
  const nowDate = format(now, "Y-m-D");
  const nowPath = path.resolve(__dirname, "../../../../data/", nowDate);

  logger.debug.log("Importing vaccine data for date %s", nowPath);
  const reportDataProcessor = processReportData(
    logger,
    EUDRVIGILANCE,
    parseEUDRVigilanceDatum,
    path.resolve(nowPath, "results")
  );
  const csvPaths = fs
    .readdirSync(path.resolve(nowPath, "import"))
    .filter((v) => v.startsWith("eudrvigilance"))
    .map((s) => path.resolve(nowPath, "import", s));

  const paths = csvPaths.reduce(
    (acc, v) => {
      return {
        janssen: v.includes("janssen") ? acc.janssen.concat(v) : acc.janssen,
        moderna: v.includes("moderna") ? acc.moderna.concat(v) : acc.moderna,
        pfizer2020:
          v.includes("pfizer") && v.includes("2020")
            ? acc.pfizer2020.concat(v)
            : acc.pfizer2020,
        pfizer2021:
          v.includes("pfizer") && v.includes("2021")
            ? acc.pfizer2021.concat(v)
            : acc.pfizer2021,
        astrazeneca: v.includes("astrazeneca")
          ? acc.astrazeneca.concat(v)
          : acc.astrazeneca,
      };
    },
    {
      janssen: [] as string[],
      moderna: [] as string[],
      pfizer2020: [] as string[],
      pfizer2021: [] as string[],
      astrazeneca: [] as string[],
    }
  );
  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      EUDRVIGILANCE_MODERNA: reportDataProcessor(
        paths.moderna,
        "eudrvigilance-moderna.json"
      ),
      EUDRVIGILANCE_PFIZER_2020: reportDataProcessor(
        paths.pfizer2020,
        path.resolve(__dirname, "eudrvigilance-pfizer-2020.json")
      ),
      EUDRVIGILANCE_PFIZER_2021: reportDataProcessor(
        paths.pfizer2021,
        path.resolve(__dirname, "eudrvigilance-pfizer-2021.json")
      ),
      EUDRVIGILANCE_ASTRAZENECA: reportDataProcessor(
        paths.astrazeneca,
        path.resolve(__dirname, "eudrvigilance-astrazeneca.json")
      ),
      EUDRVIGILANCE_JANSSEN: reportDataProcessor(
        paths.janssen,
        "eudrvigilance-janssen.json"
      ),
    }),
    TE.map(() => undefined)
  );
};

export const runAggregate = (): TE.TaskEither<Error, void> => {
  const logger = GetLogger("vaccine-aggregate-report-data");
  const nowDate = format(new Date(), "Y-m-D");
  const resultBasePath = path.resolve(
    __dirname,
    "../../../../data/",
    nowDate,
    "results"
  );
  logger.debug.log("Importing vaccine data...");
  const aggregateReportDataProcessor = processAggregateReportData(
    logger,
    resultBasePath
  );
  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      EUDRVIGILANCE: aggregateReportDataProcessor(
        [
          path.resolve(
            __dirname,
            "../../../../data/eudrvigilance-moderna.json"
          ),
          path.resolve(
            __dirname,
            "../../../../data/eudrvigilance-pfizer-2020.json"
          ),
          path.resolve(
            __dirname,
            "../../../../data/eudrvigilance-pfizer-2021.json"
          ),
          path.resolve(
            __dirname,
            "../../../../data/eudrvigilance-astrazeneca.json"
          ),
          path.resolve(
            __dirname,
            "../../../../data/eudrvigilance-janssen.json"
          ),
        ],
        path.resolve(__dirname, "../../../../data/eudrvigilance.json")
      ),
    }),
    TE.map(() => undefined)
  );
};
