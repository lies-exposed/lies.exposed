import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { NumberFromString } from "io-ts-types/NumberFromString";

export const WHOCovid19GlobalData = t.strict(
  {
    Date_reported: DateFromISOString,
    Country_code: t.string,
    Country: t.string,
    WHO_region: t.string,
    New_cases: NumberFromString,
    Cumulative_cases: NumberFromString,
    New_deaths: NumberFromString,
    Cumulative_deaths: NumberFromString,
  },
  "WHOCovid19GlobalData",
);

export type WHOCovid19GlobalData = t.TypeOf<typeof WHOCovid19GlobalData>;
