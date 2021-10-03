import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";

export const COVID19ExcessMortalityDatum = t.strict(
  {
    location: t.string,
    date: DateFromISOString,
    p_scores_0_14: optionFromNullable(t.union([NumberFromString, t.string])),
    p_scores_all_ages: optionFromNullable(NumberFromString),
    p_scores_15_64: optionFromNullable(NumberFromString),
    p_scores_65_74: optionFromNullable(NumberFromString),
    p_scores_75_84: optionFromNullable(NumberFromString),
    p_scores_85plus: optionFromNullable(NumberFromString),
    deaths_2020_all_ages: optionFromNullable(NumberFromString),
    average_deaths_2015_2019_all_ages: optionFromNullable(NumberFromString),
    deaths_2015_all_ages: optionFromNullable(NumberFromString),
    deaths_2016_all_ages: optionFromNullable(NumberFromString),
    deaths_2017_all_ages: optionFromNullable(NumberFromString),
    deaths_2018_all_ages: optionFromNullable(NumberFromString),
    deaths_2019_all_ages: optionFromNullable(NumberFromString),
    deaths_2010_all_ages: optionFromNullable(NumberFromString),
    deaths_2011_all_ages: optionFromNullable(NumberFromString),
    deaths_2012_all_ages: optionFromNullable(NumberFromString),
    deaths_2013_all_ages: optionFromNullable(NumberFromString),
    deaths_2014_all_ages: optionFromNullable(NumberFromString),
    deaths_2021_all_ages: optionFromNullable(NumberFromString),
    time: optionFromNullable(NumberFromString),
    time_unit: t.string,
    projected_deaths_2020_all_ages: optionFromNullable(NumberFromString),
    excess_proj_all_ages: optionFromNullable(NumberFromString),
    cum_excess_proj_all_ages: optionFromNullable(NumberFromString),
    cum_proj_deaths_all_ages: optionFromNullable(NumberFromString),
    cum_p_proj_all_ages: optionFromNullable(NumberFromString),
    p_proj_all_ages: optionFromNullable(NumberFromString),
    p_proj_0_14: optionFromNullable(t.union([NumberFromString, t.string])),
    p_proj_15_64: optionFromNullable(NumberFromString),
  },
  "COVID19ExcessMortalityDatum"
);

export type COVID19ExcessMortalityDatum = t.TypeOf<
  typeof COVID19ExcessMortalityDatum
>;
