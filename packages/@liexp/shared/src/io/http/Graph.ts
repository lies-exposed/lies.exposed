import * as t from "io-ts";
import { ACTORS } from "./Actor";
import { UUID } from "./Common";
import { GROUPS } from "./Group";
import { KEYWORDS } from "./Keyword";
import { NetworkGraphOutput } from "./Network";
import { Forecast } from "./climate-change/Forecast";
import { SummitEvent } from "./climate-change/SummitEvent";
import { WHOCovid19GlobalData } from "./covid/COVIDDailyDatum";
import { VaccineDatum } from "./covid/VaccineDatum";
import { VaccineDistributionDatum } from "./covid/VaccineDistributionDatum";

export const Covid19EUDR = t.union([
  t.literal("covid19/vaccines/eudr/eudrvigilance.csv"),
  t.array(VaccineDatum),
]);

export const Covid19EUDRModerna = t.union([
  t.literal("covid19/vaccines/eudr/moderna.csv"),
  t.array(VaccineDatum),
]);

export const Covid19EUDRPfizer = t.union([
  t.literal("covid19/vaccines/eudr/pfizer.csv"),
  t.array(VaccineDatum),
]);
export const Covid19EUDRAstrazeneca = t.union([
  t.literal("covid19/vaccines/eudr/astrazeneca.csv"),
  t.array(VaccineDatum),
]);
export const Covid19WorldVaccineDistribution = t.union([
  t.literal("covid19/vaccines/distribution/vaccinations.csv"),
  t.array(VaccineDistributionDatum),
]);

export const Covid19VAERS = t.union([
  t.literal("covid19/vaccines/vaers/vaers.csv"),
  t.array(VaccineDatum),
]);

export const Covid19ADRs = t.union([
  t.literal("covid19/vaccines/adr.csv"),
  t.any,
]);

export const CovidWHOWorldData = t.union([
  t.literal("covid19/who/who-covid-19-world-data.csv"),
  t.array(WHOCovid19GlobalData),
]);

export const ClimateChangeHistoryOfSummits = t.tuple([
  t.literal("climate-change/history-of-climate-summits.csv"),
  SummitEvent,
]);

export const ClimateChangeForecast = t.tuple([
  t.literal("climate-change/forecast.csv"),
  Forecast,
]);

export const GraphId = t.union(
  [
    Covid19EUDR.types[0],
    Covid19EUDRModerna.types[0],
    Covid19EUDRPfizer.types[0],
    Covid19EUDRAstrazeneca.types[0],
    Covid19VAERS.types[0],
    Covid19ADRs.types[0],
    CovidWHOWorldData.types[0],
    Covid19WorldVaccineDistribution.types[0],
    ClimateChangeHistoryOfSummits.types[0],
    ClimateChangeForecast.types[0],
  ],
  "GraphId"
);

export const GraphData = t.union(
  [
    Covid19EUDR.types[1],
    Covid19EUDRModerna.types[1],
    Covid19EUDRPfizer.types[1],
    Covid19EUDRAstrazeneca.types[1],
    Covid19VAERS.types[1],
    Covid19ADRs.types[1],
    CovidWHOWorldData.types[1],
    Covid19WorldVaccineDistribution.types[1],
    ClimateChangeHistoryOfSummits.types[1],
    ClimateChangeForecast.types[1],
  ],
  "GraphData"
);

export type GraphId = t.TypeOf<typeof GraphId>;

export const FlowGraphType = t.union(
  [KEYWORDS, ACTORS, GROUPS],
  "FlowGraphType"
);
export type FlowGraphType = t.TypeOf<typeof FlowGraphType>;

export const GetGraphByTypeParams = t.type(
  {
    id: UUID,
    type: FlowGraphType,
  },
  "GetGraphByTypeParams"
);
export type GetGraphByTypeParams = t.TypeOf<typeof GetGraphByTypeParams>;

export const FlowGraphOutput = t.strict(
  {
    ...NetworkGraphOutput.type.props,
  },
  "FlowGraphData"
);

export type FlowGraphOutput = t.TypeOf<typeof FlowGraphOutput>;
