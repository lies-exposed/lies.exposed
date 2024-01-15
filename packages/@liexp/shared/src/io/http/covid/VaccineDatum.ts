import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

export const Pfizer = t.literal("pfizer", "Pfizer");
export const Astrazeneca = t.literal("astrazeneca", "Astrazeneca");
export const Moderna = t.literal("moderna", "Moderna");
export const Janssen = t.literal("janssen", "Janssen");

export const Manufacturer = t.union(
  [Astrazeneca, Janssen, Moderna, Pfizer],
  "Manufacturer",
);

export const Female = t.literal("female", "Female");
export const Male = t.literal("male", "Male");
export const NotSpecified = t.literal("not-specified", "NotSpecified");
export const Sex = t.union([Female, Male, NotSpecified], "Sex");
export type Sex = t.TypeOf<typeof Sex>;

export const ZeroToOneMonth = t.literal("0-1-months", "01Month");
export const TwoMonthsToTwoYears = t.literal(
  "2-months-2-years",
  "2MonthsTo2Years",
);
export const ThreeToTwelveYears = t.literal("3-12-years", "3To12Years");
export const TwelveToSixteenYears = t.literal("12-17-years", "12To17Years");
export const EighteenToSixtyFourYears = t.literal("18-64-years", "18To64Years");
export const SixtyFiveToEightyfiveYears = t.literal(
  "65-85-years",
  "65To85Years",
);
export const MoreThanEightyFiveYears = t.literal(
  "more-than-85-years",
  "MoreThan85Years",
);

export const AgeGroup = t.union(
  [
    ZeroToOneMonth,
    TwoMonthsToTwoYears,
    ThreeToTwelveYears,
    TwelveToSixteenYears,
    EighteenToSixtyFourYears,
    SixtyFiveToEightyfiveYears,
    MoreThanEightyFiveYears,
    NotSpecified,
  ],
  "AgeGroup",
);
export type AgeGroup = t.TypeOf<typeof AgeGroup>;

export const VaccineDatum = t.strict(
  {
    date: DateFromISOString,
    deaths: NumberFromString,
    death_0_1_month: NumberFromString,
    death_2_month_2_years: NumberFromString,
    death_3_11_years: NumberFromString,
    death_12_17_years: NumberFromString,
    death_18_64_years: NumberFromString,
    death_65_85_years: NumberFromString,
    death_more_than_85_years: NumberFromString,
    death_years_not_specified: NumberFromString,
    injuries: NumberFromString,
    reported: NumberFromString,
    severe: NumberFromString,
    total_reported: NumberFromString,
    total_severe: NumberFromString,
    total_deaths: NumberFromString,
    total_death_0_1_month: NumberFromString,
    total_death_2_month_2_years: NumberFromString,
    total_death_3_11_years: NumberFromString,
    total_death_12_17_years: NumberFromString,
    total_death_18_64_years: NumberFromString,
    total_death_65_85_years: NumberFromString,
    total_death_more_than_85_years: NumberFromString,
    total_death_years_not_specified: NumberFromString,
    total_injuries: NumberFromString,
  },
  "VaccineDatum",
);

export type VaccineDatum = t.TypeOf<typeof VaccineDatum>;
