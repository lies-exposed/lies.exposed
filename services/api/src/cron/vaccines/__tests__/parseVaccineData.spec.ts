import * as logger from "@econnessione/core/logger";
import { VaccineDatum } from "@econnessione/shared/io/http/covid/VaccineDatum";
import { subDays } from "date-fns";
import { computeReportData } from "../eudr/parseEUDRData";

const now = new Date();
describe("Parse Vaccine Data", () => {
  const log = logger.GetLogger("parse-vaccine-data");

  test("Should compute datum by date", () => {
    const date = subDays(now, 3);
    const data: VaccineDatum[] = [
      {
        date: date,
        deaths: 3,
        reported: 1,
        injuries: 3,
        cumulativeDeaths: 0,
        cumulativeReported: 0,
        cumulativeInjuries: 0,
        patientAgeGroup: "18 65 Years",
      },
      {
        date: date,
        deaths: 1,
        reported: 1,
        injuries: 3,
        cumulativeDeaths: 0,
        cumulativeReported: 0,
        cumulativeInjuries: 0,
        patientAgeGroup: "18 65 Years",
      },
    ];
    const results = computeReportData(log)(data);
    expect(results).toMatchObject([
      {
        date: date,
        deaths: 4,
        injuries: 6,
        cumulativeDeaths: 4,
        cumulativeReported: 2,
        cumulativeInjuries: 6,
        patientAgeGroup: "18 65 Years",
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
        reported: 1,
        injuries: 10,
        cumulativeDeaths: 100,
        cumulativeReported: 150,
        cumulativeInjuries: 1000,
        patientAgeGroup: "18 65 Years",
      },
      {
        date: date,
        deaths: 3,
        reported: 1,
        injuries: 3,
        cumulativeDeaths: 200,
        cumulativeReported: 2000,
        cumulativeInjuries: 2000,
        patientAgeGroup: "18 65 Years",
      },
      {
        date: thirdDate,
        deaths: 10,
        reported: 10,
        injuries: 12,
        cumulativeDeaths: 100,
        cumulativeReported: 100,
        cumulativeInjuries: 100,
        patientAgeGroup: "24y",
      },
      {
        date,
        deaths: 1,
        reported: 1,
        injuries: 2,
        cumulativeDeaths: 10,
        cumulativeReported: 1000,
        cumulativeInjuries: 100,
        patientAgeGroup: "18 65 Years",
      },
    ];
    const results = computeReportData(log)(data);
    expect(results).toMatchObject([
      {
        date: thirdDate,
        deaths: 14,
        reported: 12,
        injuries: 17,
        cumulativeDeaths: 14,
        cumulativeReported: 12,
        patientAgeGroup: "24y",
      },
      {
        date: secondDate,
        deaths: 3,
        reported: 1,
        injuries: 10,
        cumulativeDeaths: 17,
        cumulativeReported: 13,
        cumulativeInjuries: 27,
        patientAgeGroup: "18 65 Years",
      },
    ]);
  });
});
