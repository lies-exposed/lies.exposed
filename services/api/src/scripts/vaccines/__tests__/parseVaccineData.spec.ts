import * as logger from "@econnessione/core/logger";
import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
import { subDays } from "date-fns";
import { computeTotals, reduceToReport } from "../eudr/parseEUDRData";

const now = new Date();
describe("Parse Vaccine Data", () => {
  const log = logger.GetLogger("parse-vaccine-data");

  test("Should compute datum by date", () => {
    const date = subDays(now, 3);
    const data: VaccineDatum[] = [
      {
        date: date,
        deaths: 3,
        death_0_1_month: 0,
        death_2_months_2_years: 0,
        death_3_12_years: 0,
        reported: 1,
        injuries: 3,
        severe: 10,
      },
      {
        date: date,
        death_0_1_month: 0,
        death_2_months_2_years: 0,
        death_3_12_years: 0,
        deaths: 1,
        reported: 1,
        injuries: 3,
        severe: 0,
      },
    ];
    const results = reduceToReport([data]);
    expect(results).toMatchObject([
      {
        date: date,
        deaths: 4,
        injuries: 6,
        severe: 10,
      },
    ]);
  });

  test("Should compute cumulatives data", () => {
    const date = subDays(now, 3);
    const secondDate = subDays(now, 2);
    const thirdDate = subDays(new Date(), 3);
    const data: VaccineDatum[] = [
      {
        date: secondDate,
        deaths: 3,
        death_0_1_month: 0,
        death_2_month_2_years: 0,
        death_3_12_years: 0,
        reported: 1,
        injuries: 10,
        severe: 0,
        total_reported: 150,
        total_injuries: 1000,
        total_deaths: 100,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
      },
      {
        date: date,
        deaths: 3,
        death_0_1_month: 0,
        death_2_month_2_years: 0,
        death_3_12_years: 0,
        reported: 1,
        injuries: 3,
        severe: 0,
        total_deaths: 200,
        total_reported: 2000,
        total_injuries: 2000,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
      },
      {
        date: thirdDate,
        deaths: 10,
        death_0_1_month: 0,
        death_2_month_2_years: 0,
        death_3_12_years: 0,
        reported: 10,
        injuries: 12,
        severe: 0,
        total_deaths: 100,
        total_reported: 100,
        total_injuries: 100,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
      },
      {
        date,
        deaths: 1,
        death_0_1_month: 0,
        death_2_month_2_years: 0,
        death_3_12_years: 0,
        reported: 1,
        injuries: 2,
        severe: 0,
        total_deaths: 10,
        total_reported: 1000,
        total_injuries: 100,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
      },
    ];
    const results = computeTotals(reduceToReport([data]));
    expect(results).toMatchObject([
      {
        date: thirdDate,
        deaths: 14,
        death_0_1_month: 0,
        death_2_month_2_years: 0,
        death_3_12_years: 0,
        reported: 12,
        injuries: 17,
        severe: 0,
        total_deaths: 14,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
        total_reported: 12,
        total_injuries: 17,
      },
      {
        date: secondDate,
        deaths: 3,
        reported: 1,
        injuries: 10,
        severe: 0,
        total_deaths: 17,
        total_reported: 13,
        total_injuries: 27,
        total_death_0_1_month: 0,
        total_death_2_month_2_years: 0,
        total_death_3_12_years: 0,
      },
    ]);
  });
});
