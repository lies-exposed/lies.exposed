import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";

export const VaccineDatum = t.strict(
  {
    date: DateFromISOString,
    reported: t.number,
    deaths: t.number,
    injuries: t.number,
    patientAgeGroup: t.string,
    cumulativeReported: t.number,
    cumulativeDeaths: t.number,
    cumulativeInjuries: t.number,
  },
  "VaccineDatum"
);

export type VaccineDatum = t.TypeOf<typeof VaccineDatum>;
