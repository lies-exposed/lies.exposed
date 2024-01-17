// import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger";
import { GetCSVUtil } from "@liexp/shared/lib/utils/csv.utils";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils";
import { parse } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as D from "fp-ts/Date";
import * as MapFP from "fp-ts/lib/Map.js";
import * as O from "fp-ts/lib/Option.js";
import * as Ord from "fp-ts/Ord";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as S from "fp-ts/lib/string.js";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import { TotalsReporter } from "../reporters/TotalReporter";
import { VaccineEntry } from "../types";
import { computeTotals, reduceToDateEntry } from "../utils/parse.utils";

const log = GetLogger("parse-vaers-data");
const csvUtils = GetCSVUtil({ log });

const Pfizer = t.literal("PFIZER\\BIONTECH");
const Moderna = t.literal("MODERNA");
const Janssen = t.literal("JANSSEN");
const Astrazenenca = t.literal("ASTRAZENECA");
const Manufacturer = t.union(
  [Pfizer, Moderna, Janssen, Astrazenenca, t.any],
  "Manufacturer"
);
type Manufacturer = t.TypeOf<typeof Manufacturer>;

export const VAERSVax = t.strict(
  {
    VAERS_ID: t.string,
    VAX_TYPE: t.string,
    VAX_MANU: Manufacturer,
    VAX_LOT: t.string,
    VAX_DOSE_SERIES: t.string,
    VAX_ROUTE: t.string,
    VAX_SITE: t.string,
    VAX_NAME: t.string,
  },
  "VAERSVAX"
);
export type VAERSVax = t.TypeOf<typeof VAERSVax>;

export const VAERSSymptom = t.strict(
  {
    VAERS_ID: t.string,
    SYMPTOM1: t.string,
    SYMPTOM2: t.string,
    SYMPTOM3: t.string,
    SYMPTOM4: t.string,
    SYMPTOM5: t.string,
  },
  "VAERSSymptom"
);

export type VAERSSymptom = t.TypeOf<typeof VAERSSymptom>;

export const VAERSData = t.strict(
  {
    VAERS_ID: t.union([t.undefined, t.string]),
    RECVDATE: t.union([t.undefined, t.string]),
    STATE: t.union([t.undefined, t.string]),
    AGE_YRS: t.union([t.undefined, NumberFromString]),
    CAGE_YR: t.union([t.undefined, t.string]),
    CAGE_MO: t.union([t.undefined, t.string]),
    SEX: t.union([t.undefined, t.string]),
    RPT_DATE: t.union([t.undefined, t.string]),
    SYMPTOM_TEXT: t.union([t.undefined, t.string]),
    DIED: t.union([t.undefined, t.string]),
    DATEDIED: t.union([t.undefined, t.string]),
    L_THREAD: t.union([t.undefined, t.string]),
    ER_VISIT: t.union([t.undefined, t.string]),
    HOSPITAL: t.union([t.undefined, t.string]),
    HOSPDAYS: t.union([t.undefined, t.string]),
    X_STAY: t.union([t.undefined, t.string]),
    DISABLE: t.union([t.undefined, t.string]),
    RECOVD: t.union([t.undefined, t.string]),
    VAX_DATE: t.union([t.undefined, t.string]),
    ONSET_DATE: t.union([t.undefined, t.string]),
    NUMDAYS: t.union([t.undefined, t.string]),
    V_ADMINBY: t.union([t.undefined, t.string]),
    LAB_DATA: t.union([t.undefined, t.string]),
    V_FUNDBY: t.union([t.undefined, t.string]),
    OTHER_MEDS: t.union([t.undefined, t.string]),
    CUR_ILL: t.union([t.undefined, t.string]),
    HISTORY: t.union([t.undefined, t.string]),
    PRIOR_VAX: t.union([t.undefined, t.string]),
    SPLITTYPE: t.union([t.undefined, t.string]),
    FORM_VERS: t.union([t.undefined, t.string]),
    TODAYS_DATE: t.union([t.undefined, t.string]),
    BIRTH_DEFECT: t.union([t.undefined, t.string]),
    OFC_VISIT: t.union([t.undefined, t.string]),
    ER_ED_VISIT: t.union([t.undefined, t.string]),
    ALLERGIES: t.union([t.undefined, t.string]),
  },
  "VAERSData"
);

export type VAERSDATA = t.TypeOf<typeof VAERSData>;

const vaersDataMapper = (a: any): any => {
  return {
    ...a,
    AGE_YRS: a.AGE_YRS === "" ? "0" : a.AGE_YRS,
  };
};

const getManufacturerKey = (
  m?: Manufacturer
): "pfizer" | "moderna" | "janssen" | "unknown" => {
  switch (m) {
    case "MODERNA":
      return "moderna";
    case "PFIZER\\BIONTECH":
      return "pfizer";
    case "JANSSEN":
      return "janssen";
    default:
      return "unknown";
  }
};

const toVaccineEntry = (
  data: VAERSDATA,
  vax: VAERSVax | undefined,
  symptom: VAERSSymptom | undefined
): VaccineEntry => {
  // log.debug.log("Creating vaccine entry %O", { data, vax, symptom });
  const date = data.RECVDATE ? new Date(data.RECVDATE) : new Date();
  const age = data.AGE_YRS;

  if (data.DIED) {
    log.debug.log("");
    log.debug.log(
      "Died (%s) on %s at age %d and ADR received %s",
      data.DIED,
      data.DATEDIED,
      age,
      data.RECVDATE
    );
    log.debug.log("");
  }
  const died = data.DIED === "Y" || data.DATEDIED !== "" ? 1 : 0;
  const death01Month = age && age >= 0 && age <= 0.5 ? died : 0;
  const death2Months2Years = age && age > 0.5 && age <= 2 ? died : 0;
  const death3To11Years = age && age >= 3 && age <= 11 ? died : 0;
  const death12To17Years = age && age >= 12 && age <= 17 ? died : 0;
  const death18To64Years = age && age >= 18 && age <= 64 ? died : 0;
  const death65To85Years = age && age >= 65 && age <= 85 ? died : 0;
  const deathMoreThan85Years = age && age > 85 ? died : 0;
  const deathNotSpecifiedYears = !age ? died : 0;

  const injuries = [
    symptom?.SYMPTOM1,
    symptom?.SYMPTOM2,
    symptom?.SYMPTOM3,
    symptom?.SYMPTOM4,
    symptom?.SYMPTOM5,
  ].filter((v) => v !== "").length;

  return {
    date,
    deaths: died,
    injuries,
    severe: 0,
    reported: 1,
    death_0_1_month: death01Month,
    death_2_month_2_years: death2Months2Years,
    death_3_11_years: death3To11Years,
    death_12_17_years: death12To17Years,
    death_18_64_years: death18To64Years,
    death_65_85_years: death65To85Years,
    death_more_than_85_years: deathMoreThan85Years,
    death_years_not_specified: deathNotSpecifiedYears,
  };
};

/**
 * Parse
 */

const VAERS_DATA_DIR = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers/import"
);

export const VAERS_OUTPUT_DIR = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers"
);

interface ManufacturerResults {
  pfizer: Map<string, VaccineEntry>;
  moderna: Map<string, VaccineEntry>;
  astrazeneca: Map<string, VaccineEntry>;
  janssen: Map<string, VaccineEntry>;
  unknown: Map<string, VaccineEntry>;
}

interface ReadFilesOpts {
  paths: {
    vax: string;
    data: string;
    symptoms: string;
  };
  acc: {
    vax: VAERSVax[];
    symptoms: VAERSSymptom[];
    data: VAERSDATA[];
  };
  results: ManufacturerResults;
  skipRows: number;
  maxRows: number;
}

const readFiles = ({
  paths,
  acc,
  results,
  ...opts
}: ReadFilesOpts): TE.TaskEither<Error, ManufacturerResults> => {
  const parseOpts = { headers: true, ignoreEmpty: true, ...opts };
  return pipe(
    sequenceS(TE.ApplicativePar)({
      data: csvUtils.parseFile(paths.data, parseOpts, {
        decoder: VAERSData,
        mapper: vaersDataMapper,
      }),
      vax: csvUtils.parseFile(paths.vax, parseOpts, { decoder: VAERSVax }),
      symptoms: csvUtils.parseFile(paths.symptoms, parseOpts, {
        decoder: VAERSSymptom,
      }),
    }),
    TE.chain(({ data, vax, symptoms }) => {
      log.debug.log(
        "Data length %d from range (%d, %d)",
        data.length,
        opts.skipRows,
        opts.skipRows + opts.maxRows
      );

      if (data.length === 0) {
        return TE.right(results);
      }

      // combine data, vax and symptoms by id
      const entries = pipe(
        data,
        A.map((d) => ({
          data: d,
          vax: vax.find((v) => v.VAERS_ID === d.VAERS_ID),
          symptoms: symptoms.find((s) => s.VAERS_ID === d.VAERS_ID),
        })),
        A.filter((d) => d.vax?.VAX_TYPE === "COVID19")
      );

      const newResults = pipe(
        entries,
        A.reduce(results, (acc, e) => {
          const manufacturer = getManufacturerKey(e.vax?.VAX_MANU);
          const manufacturerMap = acc[manufacturer];

          const entry = toVaccineEntry(e.data, e.vax, e.symptoms);
          const mapKey = entry.date.toISOString();

          const manufacturerResults = pipe(
            manufacturerMap,
            MapFP.lookup(S.Eq)(mapKey),
            O.fold(
              () => entry,
              (r) => reduceToDateEntry(r, [entry])
            ),
            (e) => MapFP.upsertAt(S.Eq)(mapKey, e)(manufacturerMap)
          );
          return {
            ...acc,
            [manufacturer]: manufacturerResults,
          };
        })
      );

      return readFiles({
        paths,
        ...opts,
        results: newResults,
        skipRows: opts.skipRows + opts.maxRows,
        acc: {
          vax: [],
          data: [],
          symptoms: [],
        },
      });
    })
  );
};

const VAERS_DATA_FILE = path.resolve(VAERS_DATA_DIR, "./2021VAERSData.csv");

const VAERS_SYMPTOMS_FILE = path.resolve(
  VAERS_DATA_DIR,
  "./2021VAERSSYMPTOMS.csv"
);
const VAERS_VAX_FILE = path.resolve(VAERS_DATA_DIR, "./2021VAERSVAX.csv");

export const runManufacturerReport = (): TE.TaskEither<Error, void> => {
  const mapKeyOrd = pipe(
    D.Ord,
    Ord.contramap<Date, string>((k) => parse(k))
  );

  const resultTask = (
    m: Map<string, VaccineEntry>,
    outputFile: string
  ): TE.TaskEither<Error, void> =>
    pipe(
      m,
      MapFP.toArray(mapKeyOrd),
      A.map(([key, v]) => v),
      computeTotals,
      TE.right,
      TE.chain((results) =>
        csvUtils.writeToPath(
          path.resolve(VAERS_OUTPUT_DIR, outputFile),
          results.map(({ date, ...r }) => ({
            date: distanceFromNow(date),
            ...r,
          }))
        )
      )
    );

  return pipe(
    readFiles({
      paths: {
        data: VAERS_DATA_FILE,
        vax: VAERS_VAX_FILE,
        symptoms: VAERS_SYMPTOMS_FILE,
      },
      acc: {
        vax: [],
        data: [],
        symptoms: [],
      },
      results: {
        pfizer: new Map(),
        moderna: new Map(),
        janssen: new Map(),
        astrazeneca: new Map(),
        unknown: new Map(),
      },
      skipRows: 0,
      maxRows: 30000,
    }),
    TE.chain(({ pfizer, moderna, astrazeneca, janssen, unknown }) => {
      return A.sequence(TE.ApplicativePar)([
        resultTask(pfizer, "pfizer.csv"),
        resultTask(moderna, "moderna.csv"),
        resultTask(astrazeneca, "astrazeneca.csv"),
        resultTask(janssen, "janssen.csv"),
        resultTask(unknown, "unknown.csv"),
      ]);
    }),
    TE.map(() => undefined)
  );
};

export const runTotalsReport = TotalsReporter({
  importPaths: [
    "moderna.csv",
    "pfizer.csv",
    "astrazeneca.csv",
    "janssen.csv",
    "unknown.csv",
  ].map((f) => path.resolve(VAERS_OUTPUT_DIR, f)),
  outputFile: path.resolve(VAERS_OUTPUT_DIR, "vaers.csv"),
});
