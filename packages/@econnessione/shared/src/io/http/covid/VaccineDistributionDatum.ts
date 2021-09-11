import * as t from "io-ts";
import { DateFromISOString, NumberFromString } from "io-ts-types";

export const VaccineDistributionDatum = t.strict(
  {
    date: DateFromISOString,
    location: t.string,
    iso_code: t.string,
    total_vaccinations: t.union([NumberFromString, t.string]),
    people_vaccinated: t.union([NumberFromString, t.string]),
    people_fully_vaccinated: t.union([NumberFromString, t.string]),
    total_boosters: t.union([NumberFromString, t.string]),
    daily_vaccinations_raw: t.union([NumberFromString, t.string]),
    daily_vaccinations: t.union([NumberFromString, t.string]),
    total_vaccinations_per_hundred: t.union([NumberFromString, t.string]),
    people_vaccinated_per_hundred: t.union([NumberFromString, t.string]),
    people_fully_vaccinated_per_hundred: t.union([NumberFromString, t.string]),
    total_boosters_per_hundred: t.union([NumberFromString, t.string]),
    daily_vaccinations_per_million: t.union([NumberFromString, t.string]),
  },
  "VaccineDistributionDatum"
);

export type VaccineDistributionDatum = t.TypeOf<
  typeof VaccineDistributionDatum
>;
