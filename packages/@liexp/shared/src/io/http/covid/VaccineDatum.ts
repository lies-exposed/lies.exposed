import { Schema } from "effect";

export const Pfizer = Schema.Literal("pfizer", "Pfizer");
export const Astrazeneca = Schema.Literal("astrazeneca", "Astrazeneca");
export const Moderna = Schema.Literal("moderna", "Moderna");
export const Janssen = Schema.Literal("janssen", "Janssen");

export const Manufacturer = Schema.Union(
  Astrazeneca,
  Janssen,
  Moderna,
  Pfizer,
).annotations({
  title: "Manufacturer",
});

export const Female = Schema.Literal("female", "Female");
export const Male = Schema.Literal("male", "Male");
export const NotSpecified = Schema.Literal("not-specified", "NotSpecified");
export const Sex = Schema.Union(Female, Male, NotSpecified).annotations({
  title: "Sex",
});
export type Sex = typeof Sex.Type;

export const ZeroToOneMonth = Schema.Literal("0-1-months", "01Month");
export const TwoMonthsToTwoYears = Schema.Literal(
  "2-months-2-years",
  "2MonthsTo2Years",
);
export const ThreeToTwelveYears = Schema.Literal("3-12-years", "3To12Years");
export const TwelveToSixteenYears = Schema.Literal(
  "12-17-years",
  "12To17Years",
);
export const EighteenToSixtyFourYears = Schema.Literal(
  "18-64-years",
  "18To64Years",
);
export const SixtyFiveToEightyfiveYears = Schema.Literal(
  "65-85-years",
  "65To85Years",
);
export const MoreThanEightyFiveYears = Schema.Literal(
  "more-than-85-years",
  "MoreThan85Years",
);

export const AgeGroup = Schema.Union(
  ZeroToOneMonth,
  TwoMonthsToTwoYears,
  ThreeToTwelveYears,
  TwelveToSixteenYears,
  EighteenToSixtyFourYears,
  SixtyFiveToEightyfiveYears,
  MoreThanEightyFiveYears,
  NotSpecified,
).annotations({
  title: "AgeGroup",
});
export type AgeGroup = typeof AgeGroup.Type;

export const VaccineDatum = Schema.Struct({
  date: Schema.Date,
  deaths: Schema.NumberFromString,
  death_0_1_month: Schema.NumberFromString,
  death_2_month_2_years: Schema.NumberFromString,
  death_3_11_years: Schema.NumberFromString,
  death_12_17_years: Schema.NumberFromString,
  death_18_64_years: Schema.NumberFromString,
  death_65_85_years: Schema.NumberFromString,
  death_more_than_85_years: Schema.NumberFromString,
  death_years_not_specified: Schema.NumberFromString,
  injuries: Schema.NumberFromString,
  reported: Schema.NumberFromString,
  severe: Schema.NumberFromString,
  total_reported: Schema.NumberFromString,
  total_severe: Schema.NumberFromString,
  total_deaths: Schema.NumberFromString,
  total_death_0_1_month: Schema.NumberFromString,
  total_death_2_month_2_years: Schema.NumberFromString,
  total_death_3_11_years: Schema.NumberFromString,
  total_death_12_17_years: Schema.NumberFromString,
  total_death_18_64_years: Schema.NumberFromString,
  total_death_65_85_years: Schema.NumberFromString,
  total_death_more_than_85_years: Schema.NumberFromString,
  total_death_years_not_specified: Schema.NumberFromString,
  total_injuries: Schema.NumberFromString,
}).annotations({
  title: "VaccineDatum",
});

export type VaccineDatum = typeof VaccineDatum.Type;
