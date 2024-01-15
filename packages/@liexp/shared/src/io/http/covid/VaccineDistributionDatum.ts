import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";

const NumberFromEmptyString = new t.Type(
  "NumberFromEmptyString",
  t.number.is,
  (u, c) => {
    return pipe(
      t.string.validate(u, c),
      E.chain(function (s) {
        if (s === "") {
          return t.success(0);
        }
        const n = +s;
        return isNaN(n) || s.trim() === "" ? t.failure(u, c) : t.success(n);
      }),
    );
  },
  String,
);

export const VaccineDistributionDatum = t.strict(
  {
    date: DateFromISOString,
    location: t.string,
    iso_code: t.string,
    total_vaccinations: NumberFromEmptyString,
    people_vaccinated: NumberFromEmptyString,
    people_fully_vaccinated: NumberFromEmptyString,
    total_boosters: NumberFromEmptyString,
    daily_vaccinations_raw: NumberFromEmptyString,
    daily_vaccinations: NumberFromEmptyString,
    total_vaccinations_per_hundred: NumberFromEmptyString,
    people_vaccinated_per_hundred: NumberFromEmptyString,
    people_fully_vaccinated_per_hundred: NumberFromEmptyString,
    total_boosters_per_hundred: NumberFromEmptyString,
    daily_vaccinations_per_million: NumberFromEmptyString,
  },
  "VaccineDistributionDatum",
);

export type VaccineDistributionDatum = t.TypeOf<
  typeof VaccineDistributionDatum
>;
