import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";

export const VaccineDistributionDatum = t.strict(
  {
    date: DateFromISOString,
    firstDoses: t.number,
    secondDoses: t.number,
    cumulativeFirstDoses: t.number,
    cumulativeSecondDoses: t.number,
  },
  "VaccineDatum"
);

export type VaccineDistributionDatum = t.TypeOf<
  typeof VaccineDistributionDatum
>;
