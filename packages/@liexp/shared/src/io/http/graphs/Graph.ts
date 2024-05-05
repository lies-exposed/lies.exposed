import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Forecast } from "../climate-change/Forecast.js";
import { SummitEvent } from "../climate-change/SummitEvent.js";
import { WHOCovid19GlobalData } from "../covid/COVIDDailyDatum.js";
import { VaccineDatum } from "../covid/VaccineDatum.js";
import { VaccineDistributionDatum } from "../covid/VaccineDistributionDatum.js";

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
  "GraphId",
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
  "GraphData",
);

export type GraphId = t.TypeOf<typeof GraphId>;

export const GraphType = t.union(
  [t.literal("reactflow"), t.literal("AxisGraph")],
  "GraphType",
);
export type GraphType = t.TypeOf<typeof GraphType>;

export const CreateGraphData = t.strict(
  {
    type: GraphType,
    label: t.string,
    slug: t.string,
    data: t.any,
    options: t.any,
  },
  "CreateGraphData",
);
export type CreateGraphData = t.TypeOf<typeof CreateGraphData>;

export const Graph = t.strict(
  {
    ...CreateGraphData.type.props,
    id: UUID,
  },
  "Graph",
);
export type Graph = t.TypeOf<typeof Graph>;
