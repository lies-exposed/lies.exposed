import * as t from "io-ts";
import { DateFromISOString, NumberFromString } from "io-ts-types";

export const Female = t.literal("female");
export const Male = t.literal("male");
export const NotSpecified = t.literal("not-specified");
export const Sex = t.union([Female, Male, NotSpecified], "Sex");
export type Sex = t.TypeOf<typeof Sex>;

export const ZeroToOneMonth = t.literal("0-1-months");
export const TwoMonthsToTwoYears = t.literal("2-months-2-years");
export const ThreeToTwelveYears = t.literal("3-12-years");
export const TwelveToSixteenYears = t.literal("12-17-years");
export const EighteenToSixtyFourYears = t.literal("18-64-years");
export const SixtyFiveToEightyfiveYears = t.literal("65-85-years");
export const MoreThanEightyFiveYears = t.literal("more-than-85-years");

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
  "AgeGroup"
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
    total_injuries: NumberFromString,
  },
  "VaccineDatum"
);

export type VaccineDatum = t.TypeOf<typeof VaccineDatum>;
