import { Schema } from "effect";
import { UUID } from "../Common/UUID.js";
import { Forecast } from "../climate-change/Forecast.js";
import { SummitEvent } from "../climate-change/SummitEvent.js";
import { WHOCovid19GlobalData } from "../covid/COVIDDailyDatum.js";
import { VaccineDatum } from "../covid/VaccineDatum.js";
import { VaccineDistributionDatum } from "../covid/VaccineDistributionDatum.js";

const Covid19EUDR = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/eudrvigilance.csv"),
  Schema.Array(VaccineDatum),
);

const Covid19EUDRModerna = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/moderna.csv"),
  Schema.Array(VaccineDatum),
);

const Covid19EUDRPfizer = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/pfizer.csv"),
  Schema.Array(VaccineDatum),
);
const Covid19EUDRAstrazeneca = Schema.Union(
  Schema.Literal("covid19/vaccines/eudr/astrazeneca.csv"),
  Schema.Array(VaccineDatum),
);
const Covid19WorldVaccineDistribution = Schema.Union(
  Schema.Literal("covid19/vaccines/distribution/vaccinations.csv"),
  Schema.Array(VaccineDistributionDatum),
);

const Covid19VAERS = Schema.Union(
  Schema.Literal("covid19/vaccines/vaers/vaers.csv"),
  Schema.Array(VaccineDatum),
);

const Covid19ADRs = Schema.Union(
  Schema.Literal("covid19/vaccines/adr.csv"),
  Schema.Any,
);

const CovidWHOWorldData = Schema.Union(
  Schema.Literal("covid19/who/who-covid-19-world-data.csv"),
  Schema.Array(WHOCovid19GlobalData),
);

const ClimateChangeHistoryOfSummits = Schema.Tuple(
  Schema.Literal("climate-change/history-of-climate-summits.csv"),
  SummitEvent,
);

const ClimateChangeForecast = Schema.Tuple(
  Schema.Literal("climate-change/forecast.csv"),
  Forecast,
);

const GraphId = Schema.Union(
  Covid19EUDR.members[0],
  Covid19EUDRModerna.members[0],
  Covid19EUDRPfizer.members[0],
  Covid19EUDRAstrazeneca.members[0],
  Covid19VAERS.members[0],
  Covid19ADRs.members[0],
  CovidWHOWorldData.members[0],
  Covid19WorldVaccineDistribution.members[0],
  ClimateChangeHistoryOfSummits.elements[0],
  ClimateChangeForecast.elements[0],
).annotations({ title: "GraphId" });

const GraphData = Schema.Union(
  Covid19EUDR.members[1],
  Covid19EUDRModerna.members[1],
  Covid19EUDRPfizer.members[1],
  Covid19EUDRAstrazeneca.members[1],
  Covid19VAERS.members[1],
  Covid19ADRs.members[1],
  CovidWHOWorldData.members[1],
  Covid19WorldVaccineDistribution.members[1],
  ClimateChangeHistoryOfSummits.elements[1],
  ClimateChangeForecast.elements[1],
).annotations({ title: "GraphData" });

type GraphId = typeof GraphId.Type;

const GraphType = Schema.Union(
  Schema.Literal("reactflow"),
  Schema.Literal("AxisGraph"),
).annotations({ title: "GraphType" });
type GraphType = typeof GraphType.Type;

const CreateGraphData = Schema.Struct({
  type: GraphType,
  label: Schema.String,
  slug: Schema.String,
  data: Schema.Any,
  options: Schema.Any,
}).annotations({ title: "CreateGraphData" });
type CreateGraphData = typeof CreateGraphData.Type;

const Graph = Schema.extend(
  Schema.Struct({ id: UUID }),
  CreateGraphData,
).annotations({
  title: "Graph",
});
type Graph = typeof Graph.Type;

export {
  Graph,
  GraphId,
  GraphData,
  CreateGraphData,
  GraphType,
  Covid19EUDR,
  Covid19EUDRModerna,
  Covid19EUDRPfizer,
  Covid19EUDRAstrazeneca,
  Covid19VAERS,
  Covid19ADRs,
  CovidWHOWorldData,
  ClimateChangeHistoryOfSummits,
  ClimateChangeForecast,
  Covid19WorldVaccineDistribution,
};
