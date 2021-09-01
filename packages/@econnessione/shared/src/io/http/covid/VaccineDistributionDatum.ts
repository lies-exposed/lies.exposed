import * as t from "io-ts";
import { DateFromISOString, NumberFromString } from "io-ts-types";

export const VaccineDistributionDatum = t.strict(
  {
    date: DateFromISOString,
    location: t.string,
    iso_code: t.string,
    total_vaccinations: NumberFromString,
    people_vaccinated: NumberFromString,
    people_fully_vaccinated: NumberFromString,
    total_boosters: NumberFromString,
    daily_vaccinations_raw: NumberFromString,
    daily_vaccinations: NumberFromString,
    total_vaccinations_per_hundred: NumberFromString,
    people_vaccinated_per_hundred: NumberFromString,
    people_fully_vaccinated_per_hundred: NumberFromString,
    total_boosters_per_hundred: NumberFromString,
    daily_vaccinations_per_million: NumberFromString,
  },
  "VaccineDistributionDatum"
);

export type VaccineDistributionDatum = t.TypeOf<
  typeof VaccineDistributionDatum
>;
