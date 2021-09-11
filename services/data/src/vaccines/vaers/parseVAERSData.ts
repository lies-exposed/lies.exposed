// import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import { formatISO } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as MapFP from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import { VaccineEntry } from "../types";
import { computeTotals, reduceToDateEntry } from "../utils/parse.utils";

const log = GetLogger("parse-vaers-data");
const csvUtils = GetCSVUtil({ log });

export const VAERSVax = t.strict(
  {
    VAERS_ID: t.string,
    VAX_TYPE: t.string,
    VAX_MANU: t.string,
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
  };
};

/**
 * Parse
 */

const VAERS_DATA_FOLDER = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers/import"
);

const VAERS_DATA_OUTPUT_FILE = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers/vaers.csv"
);

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
  results: Map<string, VaccineEntry>;
  skipRows: number;
  maxRows: number;
}

const readFiles = ({
  paths,
  acc,
  results,
  ...opts
}: ReadFilesOpts): TE.TaskEither<Error, Map<string, VaccineEntry>> => {
  const parseOpts = { headers: true, ...opts };
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
        A.map((d) => toVaccineEntry(d.data, d.vax, d.symptoms))
      );

      const newResults = pipe(
        entries,
        A.reduce(results, (acc, e) => {
          const mapKey = e.date.toISOString();

          return pipe(
            acc,
            MapFP.lookupWithKey(S.Eq)(mapKey),
            O.fold(
              () => e,
              ([key, r]) => reduceToDateEntry(r, [e])
            ),
            (e) => MapFP.upsertAt(S.Eq)(mapKey, e)(acc)
          );
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

export const runParseVAERSData = (): TE.TaskEither<Error, void> => {
  const VAERS_DATA_FILE = path.resolve(
    VAERS_DATA_FOLDER,
    "./2021VAERSData.csv"
  );

  const VAERS_SYMPTOMS_FILE = path.resolve(
    VAERS_DATA_FOLDER,
    "./2021VAERSSYMPTOMS.csv"
  );
  const VAERS_VAX_FILE = path.resolve(VAERS_DATA_FOLDER, "./2021VAERSVAX.csv");

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
      results: new Map(),
      skipRows: 0,
      maxRows: 30000,
    }),
    // log.debug.logInTaskEither("Results %O"),
    TE.map(MapFP.toArray(S.Ord)),
    TE.map(A.map(([key, v]) => v)),
    TE.map((results) => computeTotals(results)),
    TE.chain((results) =>
      csvUtils.writeToPath(
        VAERS_DATA_OUTPUT_FILE,
        results.map(({ date, ...r }) => ({
          date: formatISO(date, { representation: "date" }),
          ...r,
        }))
      )
    )
  );
};
