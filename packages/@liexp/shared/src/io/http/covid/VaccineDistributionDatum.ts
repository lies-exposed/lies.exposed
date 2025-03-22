import { ParseResult, Schema } from "effect";

export const NumberFromEmptyString = Schema.transformOrFail(
  Schema.String,
  Schema.Number,
  {
    strict: true,

    decode: (s, options, ast) => {
      s = s.trim();
      if (s === "") {
        return ParseResult.succeed(0);
      }
      const n = +s;
      return isNaN(n)
        ? ParseResult.fail(
            new ParseResult.Type(ast, s, "Failed to convert string to number "),
          )
        : ParseResult.succeed(n);
    },
    encode: (n) => ParseResult.succeed(n.toString()),
  },
).pipe(Schema.brand("NumberFromEmptyString"));

export type NumberFromEmptyString = typeof NumberFromEmptyString.Type;

export const VaccineDistributionDatum = Schema.Struct({
  date: Schema.DateFromString,
  location: Schema.String,
  iso_code: Schema.String,
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
}).annotations({
  title: "VaccineDistributionDatum",
});

export type VaccineDistributionDatum = typeof VaccineDistributionDatum.Type;
