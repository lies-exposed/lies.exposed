import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";

export const Covid19EUDR = t.literal(
  "covid19/vaccines/eudr/results/eudrvigilance.csv"
);

export const Covid19EUDRModerna = t.literal(
  "covid19/vaccines/eudr/results/moderna.csv"
);
export const Covid19EUDRPfizer = t.literal(
  "covid19/vaccines/eudr/results/pfizer.csv"
);
export const Covid19EUDRAstrazeneca = t.literal(
  "covid19/vaccines/eudr/results/astrazeneca.csv"
);
export const Covid19VaccineWorldDistribution = t.literal(
  "covid19/vaccines/distribution/world-distribution.csv"
);

export const CovidVAERS = t.literal("covid19/vaccines/vaers/results/vaers.csv");

export const ClimateChangeHistoryOfSummits = t.literal(
  "climate-change/history-of-climate-summits.csv"
);

export const ClimateChangeForecast = t.literal("climate-change/forecast.csv");

export const GraphId = t.union(
  [
    Covid19EUDR,
    Covid19EUDRModerna,
    Covid19EUDRPfizer,
    Covid19EUDRAstrazeneca,
    CovidVAERS,
    Covid19VaccineWorldDistribution,
    ClimateChangeHistoryOfSummits,
    ClimateChangeForecast,
  ],
  "GraphId"
);
export type GraphId = t.TypeOf<typeof GraphId>;

export const GetGraph = Endpoint({
  Method: "GET",
  getPath: () => `/graphs`,
  Input: {
    Query: t.type({ id: GraphId }),
  },
  Output: t.strict({ data: t.unknown }),
});

// export const graphs = ResourceEndpoints({
//   Get: GetGraph,
// } as any);
