// import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { GetCSVUtil } from "@econnessione/shared/utils/csv.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as MapFP from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import { VaccineEntry } from "vaccines/types";

const log = GetLogger("parse-vaers-data");

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
  log.debug.log("Creating vaccine entry %O", { data, vax, symptom });
  const date = data.RECVDATE ? new Date(data.RECVDATE) : new Date();
  const age = data.AGE_YRS;

  if (age && age < 2) {
    log.debug.log("ADR patient age $O", { age });
  }
  if (data.DATEDIED) {
    log.debug.log("Died on %s", data.DATEDIED);
  }
  const died = data.DIED === "Y" ? 1 : 0;
  const death01Month = age && age < 1 ? died : 0;
  const death2Months2Years = age && age > 2 ? died : 0;

  log.debug.log("Is dead %s", data.DIED);
  log.debug.log("Death 0-1 month? %s", death01Month);

  return {
    date,
    injuries: 0,
    severe: 0,
    reported: 1,
    death_0_1_month: death2Months2Years,
    death_2_month_2_years: death2Months2Years,
    death_12_17_years: 0,
    death_18_64_years: 0,
    death_3_11_years: 0,
    death_65_85_years: 0,
    death_more_than_85_years: 0,
    deaths: died,
  };
};

/**
 * Parse
 */

const VAERS_DATA_FOLDER = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers"
);

const VAERS_DATA_OUTPUT_FILE = path.resolve(
  __dirname,
  "../../../public/covid19/vaccines/vaers/results/vaers.csv"
);

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

  const csvUtils = GetCSVUtil({ log });

  const readFileTask = <A, O = A, I = unknown>(
    filePath: string,
    decoder: t.Type<A, O, I>,
    mapper?: (a: any) => any
  ): TE.TaskEither<Error, Map<string, A>> => {
    return pipe(
      csvUtils.parseFile(
        filePath,
        decoder,
        new Map<string, A>(),
        (acc, item) => {
          const oldData = MapFP.lookupWithKey(S.Eq)(item.VAERS_ID)(acc);
          const newItem = pipe(
            oldData,
            O.fold(
              () => item,
              ([key, value]) => ({
                ...value,
              })
            )
          );

          return MapFP.upsertAt(S.Eq)(item.VAERS_ID, newItem)(acc);
        },
        { mapper }
      ),
      TE.map((map) => {
        log.debug.log("Created map (%d) for %s", MapFP.size(map), filePath);
        return map;
      })
    );
  };

  const dataTask = readFileTask(VAERS_DATA_FILE, VAERSData, vaersDataMapper);
  const symptomsTask = readFileTask(VAERS_SYMPTOMS_FILE, VAERSSymptom);

  return pipe(
    sequenceS(TE.taskEither)({
      data: dataTask,
      symptoms: symptomsTask,
      vax: readFileTask(VAERS_VAX_FILE, VAERSVax),
    }),
    TE.map(({ data, symptoms, vax }) => {
      log.debug.log(
        "Got data (%d), symptoms (%d), vax (%d)",
        MapFP.size(data),
        MapFP.size(symptoms),
        MapFP.size(vax)
      );
      const entries = pipe(
        data,
        MapFP.toArray(S.Ord),
        A.reduce(new Map(), (acc, [key, v]) => {
          const currentVax = pipe(
            vax,
            MapFP.lookupWithKey(S.Eq)(key),
            O.map((s) => s[1]),
            O.toUndefined
          );

          const currentSymtomps = pipe(
            symptoms,
            MapFP.lookupWithKey(S.Eq)(key),
            O.map((s) => s[1]),
            O.toUndefined
          );

          if (currentVax?.VAX_MANU) {
            if (
              ["PFIZER", "MODERNA", "ASTRAZENECA"].includes(currentVax.VAX_MANU)
            ) {
              const entry = toVaccineEntry(v, currentVax, currentSymtomps);
              const updatedAcc = MapFP.upsertAt(S.Eq)(key, entry)(acc);
              return updatedAcc;
            }
          }

          return acc;
        }),
        MapFP.toArray(S.Ord),
        A.map(([key, value]) => value)
      );

      log.debug.log("Parsed entries datum %O", entries);

      return entries;
    }),
    TE.chain((results) => csvUtils.writeToPath(VAERS_DATA_OUTPUT_FILE, results))
  );
};
