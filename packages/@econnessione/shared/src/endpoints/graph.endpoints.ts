import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { GetListQuery } from "../io/http/Query";
import { Forecast } from "../io/http/climate-change/Forecast";
import { SummitEvent } from "../io/http/climate-change/SummitEvent";
import { WHOCovid19GlobalData } from "../io/http/covid/COVIDDailyDatum";
import { VaccineDatum } from "../io/http/covid/VaccineDatum";
import { VaccineDistributionDatum } from "../io/http/covid/VaccineDistributionDatum";
import { ResourceEndpoints } from "./types";

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

export const GetGraph = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({ id: GraphId }),
  },
  Output: t.strict({ data: GraphData }),
});

export const ListGraphs = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: t.partial({
      ...GetListQuery.props,
    }),
  },
  Output: t.strict({ data: t.array(GraphData) }),
});

export const CreateGraph = Endpoint({
  Method: "POST",
  getPath: () => `/graphs`,
  Input: {
    Body: t.unknown,
  },
  Output: t.strict({ data: GraphData }),
});

export const EditGraph = Endpoint({
  Method: "PUT",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({
      id: GraphId,
    }),
  },
  Output: t.strict({ data: GraphData }),
});

export const DeleteGraph = Endpoint({
  Method: "DELETE",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({
      id: GraphId,
    }),
  },
  Output: t.strict({ data: GraphData }),
});

export const graphs = ResourceEndpoints({
  Get: GetGraph,
  List: ListGraphs,
  Create: CreateGraph,
  Edit: EditGraph,
  Delete: DeleteGraph,
});
