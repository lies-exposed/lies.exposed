/* eslint-disable @typescript-eslint/naming-convention */
import { Logger } from "@liexp/core/lib/logger";
import { VaccineDatum } from "@liexp/shared/lib/io/http/covid/VaccineDatum";
import { groupBy } from "@liexp/shared/lib/utils/array.utils";
import * as A from "fp-ts/Array";
import * as D from "fp-ts/Date";
import * as Eq from "fp-ts/Eq.js";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import { pipe } from "fp-ts/function";
import { VaccineEntry } from "../types";

const sortByDate = pipe(
  D.Ord,
  Ord.contramap<Date, VaccineEntry>((d) => d.date)
);

const eqVaccineDate = pipe(
  D.eqDate,
  Eq.contramap<Date, VaccineEntry>((d) => d.date)
);

export const mergeByDate = (data: VaccineEntry[]): VaccineEntry[] => {
  return pipe(
    data,
    A.sort(sortByDate),
    groupBy(eqVaccineDate),
    A.reduce([] as VaccineEntry[], (acc, entriesByDate) => {
      const rest = pipe(
        entriesByDate,
        A.tail,
        O.getOrElse((): VaccineEntry[] => [])
      );
      return acc.concat(reduceToDateEntry(entriesByDate[0], rest));
    })
  );
};

export const ReportReducer =
  (l: Logger) =>
  (data: VaccineEntry[][]): VaccineEntry[] => {
    l.debug.log("Reducing nested results (%d)", data.length);
    return data.reduce<VaccineEntry[]>((acc, v) => {
      l.debug.log(
        "Combine accumulated results (%d) with other entries (%d)",
        acc.length,
        v.length
      );
      return mergeByDate([...acc, ...v]);
    }, []);
  };

export const reduceToDateEntry = (
  init: VaccineEntry,
  results: VaccineEntry[]
): VaccineEntry => {
  return pipe(
    results,
    A.reduce(init, (acc, v) => {
      return {
        ...v,
        deaths: acc.deaths + v.deaths,
        death_0_1_month: acc.death_0_1_month + v.death_0_1_month,
        death_2_month_2_years:
          acc.death_2_month_2_years + v.death_2_month_2_years,
        death_3_12_years: acc.death_3_11_years + v.death_3_11_years,
        death_12_17_years: acc.death_12_17_years + v.death_12_17_years,
        death_18_64_years: acc.death_18_64_years + v.death_18_64_years,
        death_65_85_years: acc.death_65_85_years + v.death_65_85_years,
        death_more_than_85_years:
          acc.death_more_than_85_years + v.death_more_than_85_years,
        injuries: acc.injuries + v.injuries,
        severe: acc.severe + v.severe,
        reported: acc.reported + v.reported,
      };
    })
  );
};

export const computeTotals = (data: VaccineEntry[]): VaccineEntry[] => {
  return pipe(
    data,
    A.reduce(
      {
        date: new Date(),
        total_deaths: 0,
        total_reported: 0,
        total_injuries: 0,
        total_severe: 0,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_11_years: 0,
        total_death_12_17_years: 0,
        total_death_18_64_years: 0,
        total_death_65_85_years: 0,
        total_death_more_than_85_years: 0,
        total_death_years_not_specified: 0,
        results: [] as VaccineDatum[],
      },
      (acc, v) => {
        const total_deaths = acc.total_deaths + v.deaths;
        const total_reported = acc.total_reported + v.reported;
        const total_injuries = acc.total_injuries + v.injuries;
        const total_severe = acc.total_severe + v.severe;
        const total_death_0_1_month =
          acc.total_death_0_1_month + v.death_0_1_month;
        const total_death_2_month_2_years =
          acc.total_death_2_month_2_years + v.death_2_month_2_years;
        const total_death_3_11_years =
          acc.total_death_3_11_years + v.death_3_11_years;
        const total_death_12_17_years =
          acc.total_death_12_17_years + v.death_12_17_years;
        const total_death_18_64_years =
          acc.total_death_18_64_years + v.death_18_64_years;
        const total_death_65_85_years =
          acc.total_death_65_85_years + v.death_65_85_years;
        const total_death_more_than_85_years =
          acc.total_death_more_than_85_years + v.death_more_than_85_years;
        const total_death_years_not_specified =
          acc.total_death_years_not_specified + v.death_years_not_specified;

        const result = {
          ...v,
          total_deaths,
          total_reported,
          total_injuries,
          total_severe,
          total_death_0_1_month,
          total_death_2_month_2_years,
          total_death_3_11_years,
          total_death_12_17_years,
          total_death_18_64_years,
          total_death_65_85_years,
          total_death_more_than_85_years,
          total_death_years_not_specified,
        };
        return {
          date: v.date,
          total_deaths,
          total_injuries,
          total_reported,
          total_severe,
          total_death_0_1_month,
          total_death_2_month_2_years,
          total_death_3_11_years,
          total_death_12_17_years,
          total_death_18_64_years,
          total_death_65_85_years,
          total_death_more_than_85_years,
          total_death_years_not_specified,
          results: acc.results.concat(result),
        };
      }
    ),
    ({ results }) => results
  );
};
