import { Schema } from "effect";

export const WHOCovid19GlobalData = Schema.Struct({
  Date_reported: Schema.Date,
  Country_code: Schema.String,
  Country: Schema.String,
  WHO_region: Schema.String,
  New_cases: Schema.NumberFromString,
  Cumulative_cases: Schema.NumberFromString,
  New_deaths: Schema.NumberFromString,
  Cumulative_deaths: Schema.NumberFromString,
}).annotations({
  title: "WHOCovid19GlobalData",
});

export type WHOCovid19GlobalData = typeof WHOCovid19GlobalData.Type;
