import { Schema } from "effect";
import { UUID } from "../Common/UUID.js";
import { Forecast } from "../climate-change/Forecast.js";
import { SummitEvent } from "../climate-change/SummitEvent.js";
import { WHOCovid19GlobalData } from "../covid/COVIDDailyDatum.js";
import { VaccineDatum } from "../covid/VaccineDatum.js";
import { VaccineDistributionDatum } from "../covid/VaccineDistributionDatum.js";

export const Covid19EUDR = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/eudrvigilance.csv"),
  Schema.Array(VaccineDatum),
);

export const Covid19EUDRModerna = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/moderna.csv"),
  Schema.Array(VaccineDatum),
);

export const Covid19EUDRPfizer = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/pfizer.csv"),
  Schema.Array(VaccineDatum),
);
export const Covid19EUDRAstrazeneca = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/astrazeneca.csv"),
  Schema.Array(VaccineDatum),
);
export const Covid19WorldVaccineDistribution = Schema.Union(
  Schema.Literal("covid19/vaccines/distribution/vaccinations.csv"),
  Schema.Array(VaccineDistributionDatum),
);

export const Covid19VAERS = Schema.Union(
  Schema.Literal("covid19/vaccines/vaers/vaers.csv"),
  Schema.Array(VaccineDatum),
);

export const Covid19ADRs = Schema.Union(
  Schema.Literal("covid19/vaccines/adr.csv"),
  Schema.Any,
);

export const CovidWHOWorldData = Schema.Union(
  Schema.Literal("covid19/who/who-covid-19-world-data.csv"),
  Schema.Array(WHOCovid19GlobalData),
);

export const ClimateChangeHistoryOfSummits = Schema.Tuple(
  Schema.Literal("climate-change/history-of-climate-summits.csv"),
  SummitEvent,
);

export const ClimateChangeForecast = Schema.Tuple(
  Schema.Literal("climate-change/forecast.csv"),
  Forecast,
);

export const GraphId = Schema.Union(
  Covid19EUDR.Type[0],
  Covid19EUDRModerna.Type[0],
  Covid19EUDRPfizer.Type[0],
  Covid19EUDRAstrazeneca.Type[0],
  Covid19VAERS.Type[0],
  Covid19ADRs.Type[0],
  CovidWHOWorldData.Type[0],
  Covid19WorldVaccineDistribution.Type[0],
  ClimateChangeHistoryOfSummits.Type[0],
  ClimateChangeForecast.Type[0],
).annotations({ title: "GraphId" });

export const GraphData = Schema.Union(
  Covid19EUDR.Type[1],
  Covid19EUDRModerna.Type[1],
  Covid19EUDRPfizer.Type[1],
  Covid19EUDRAstrazeneca.Type[1],
  Covid19VAERS.Type[1],
  Covid19ADRs.Type[1],
  CovidWHOWorldData.Type[1],
  Covid19WorldVaccineDistribution.Type[1],
  ClimateChangeHistoryOfSummits.Type[1],
  ClimateChangeForecast.Type[1],
).annotations({ title: "GraphData" });

export type GraphId = typeof GraphId.Type;

export const GraphType = Schema.Union(
  Schema.Literal("reactflow"),
  Schema.Literal("AxisGraph"),
).annotations({ title: "GraphType" });
export type GraphType = typeof GraphType.Type;

export const CreateGraphData = Schema.Struct({
  type: GraphType,
  label: Schema.String,
  slug: Schema.String,
  data: Schema.Any,
  options: Schema.Any,
}).annotations({ title: "CreateGraphData" });
export type CreateGraphData = typeof CreateGraphData.Type;

export const Graph = Schema.extend(
  Schema.Struct({ id: UUID }),
  CreateGraphData,
).annotations({
  title: "Graph",
});
export type Graph = typeof Graph.Type;
