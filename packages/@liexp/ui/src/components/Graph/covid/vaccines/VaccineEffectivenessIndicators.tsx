import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import * as React from "react";
import {
  BarStackGraph,
  type TooltipData,
} from "../../../Common/Graph/BarStackGraph.js";
import { Grid, Typography } from "../../../mui/index.js";

type DataGroup = "Vaccine" | "Placebo" | "Vaccine Severe" | "Placebo Severe";

interface Data {
  group: DataGroup;
  AR?: number;
  ARR?: number;
  RRR?: number;
  infected: number;
  healthy: number;
  total: number;
}
const infectedColor = "#bd0303";
const healthyColor = "#43e5a2";

const totalVolunteers = 30420;
const vaccineVolunteers = totalVolunteers / 2;
const placeboVolunteers = totalVolunteers / 2;
const vaccineInfected = 11;
const placeboInfected = 185;
const severePlaceboInfected = 30;
const severeVaccinatedInfected = 0;

const infectionsData: Data[] = [
  {
    group: "Placebo" as const,
    infected: placeboInfected,
    total: placeboVolunteers,
  },
  {
    group: "Vaccine" as const,
    infected: vaccineInfected,
    total: vaccineVolunteers,
  },
].map((d) => ({ healthy: d.total - d.infected, ...d, group: d.group }));
type Keys = keyof Data;

const keys: Keys[] = ["infected", "healthy"];

const severeData: Data[] = [
  {
    group: "Placebo Severe" as const,
    infected: severePlaceboInfected,
    total: placeboVolunteers,
  },
  {
    group: "Vaccine Severe" as const,
    infected: severeVaccinatedInfected,
    total: vaccineVolunteers,
  },
].map((d) => ({ healthy: d.total - d.infected, ...d, group: d.group }));

const graphMargin = { top: 60, right: 60, bottom: 60, left: 60 };
const xScalePadding = 0.7;
export class VaccineEffectivenessIndicators extends React.PureComponent {
  render(): React.ReactElement {
    // infections
    const infectionsXScale = scaleBand<string>({
      domain: infectionsData.map((d) => d.group),
      padding: xScalePadding,
    });
    const infectionsYScale = scaleLinear<number>({
      domain: [0, totalVolunteers / 2],
      nice: true,
    });

    // severe infections
    const severeInfectionsXScale = scaleBand<string>({
      domain: severeData.map((d) => d.group),
      padding: xScalePadding,
    });
    // RR scale
    const riskReductionYScale = scaleLinear<number>({
      domain: [0, 185],
      nice: true,
    });
    // colors
    const colorScale = scaleOrdinal<Keys, string>({
      domain: keys,
      range: [infectedColor, healthyColor],
    });

    const tooltipRenderer = ({
      key,
      bar: { data },
    }: TooltipData<Data, Keys>): React.ReactElement => {
      const AR = (data.infected / data.total) * 100;
      return (
        <div style={{ background: "#000" }}>
          <div style={{ color: colorScale(key) }}>
            {key}: {data[key]}
          </div>
          <div>AR: {AR.toFixed(2)}%</div>

          {data.group === "Vaccine" ? (
            <div>
              <div>
                RRR:{" "}
                {(
                  100 -
                  (data.infected / infectionsData[0].infected) * 100
                ).toFixed(2)}
                %
              </div>
            </div>
          ) : null}
          {data.group === "Vaccine Severe" ? (
            <div>
              <div>
                RRR:{" "}
                {(100 - (data.infected / severeData[0].infected) * 100).toFixed(
                  2,
                )}
                %
              </div>
            </div>
          ) : null}
        </div>
      );
    };

    // infections indicators
    const placeboRI = (placeboInfected / placeboVolunteers) * 100;
    const vaccineRI = (vaccineInfected / vaccineVolunteers) * 100;
    const ARR = placeboRI - vaccineRI;
    const RRR = 100 - (vaccineInfected / placeboInfected) * 100;

    // severe infections indicators
    const placeboSevereRI = (severePlaceboInfected / placeboVolunteers) * 100;
    const vaccineSevereRI =
      (severeVaccinatedInfected / vaccineVolunteers) * 100;
    const ASRR = placeboSevereRI - vaccineSevereRI;
    const RSRR = 100 - (severeVaccinatedInfected / severePlaceboInfected) * 100;

    return (
      <Grid container>
        <Typography variant="h2">Vaccine Effectiveness Indicators</Typography>
        <Grid container spacing={3}>
          <Grid size={{ md: 12 }}>
            <Typography variant="h5">Infections</Typography>
          </Grid>

          <Grid size={{ md: 4 }}>
            <ParentSize style={{ width: "100%" }}>
              {({ width }) => (
                <BarStackGraph
                  data={infectionsData}
                  keys={keys}
                  xScale={infectionsXScale}
                  yScale={infectionsYScale}
                  colorScale={colorScale}
                  width={width}
                  height={300}
                  margin={graphMargin}
                  getX={(data) => data.group}
                  tooltipRenderer={tooltipRenderer}
                />
              )}
            </ParentSize>
          </Grid>
          <Grid size={{ md: 4 }}>
            <ParentSize style={{ width: "100%" }}>
              {({ width }) => (
                <BarStackGraph
                  data={infectionsData}
                  keys={["infected"]}
                  xScale={infectionsXScale}
                  yScale={riskReductionYScale}
                  colorScale={colorScale}
                  width={width}
                  height={300}
                  margin={graphMargin}
                  getX={(data) => data.group}
                  tooltipRenderer={tooltipRenderer}
                />
              )}
            </ParentSize>
          </Grid>
          <Grid size={{ md: 4 }}>
            <Typography variant="body1">
              Volunteers: {totalVolunteers}
            </Typography>
            <Typography variant="body1">
              Placebo Infected: {placeboInfected}
            </Typography>
            <Typography variant="body1">
              Vaccine Infected: {vaccineInfected}
            </Typography>

            <Typography variant="body1">
              Placebo Risk of Infection (PRI){" "}
            </Typography>
            <Typography variant="h3">{placeboRI.toFixed(4)}%</Typography>
            <Typography variant="body1">
              Vaccine Risk of Infection (VRI){" "}
            </Typography>
            <Typography variant="h3">{vaccineRI.toFixed(4)}%</Typography>
            <Typography variant="body1">
              Absolute Risk Reduction (ARR){" "}
            </Typography>
            <Typography variant="h3">{ARR.toFixed(2)}%</Typography>
            <Typography variant="body1">
              Relative Risk Reduction (RRR){" "}
              <Typography variant="h3">{RRR.toFixed(2)}%</Typography>
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ md: 12 }}>
            <Typography variant="h5">Severe Infections</Typography>
          </Grid>
          <Grid size={{ md: 4 }}>
            <ParentSize style={{ width: "100%" }}>
              {({ width }) => (
                <BarStackGraph
                  data={severeData}
                  keys={keys}
                  xScale={severeInfectionsXScale}
                  yScale={infectionsYScale}
                  colorScale={colorScale}
                  width={width}
                  height={300}
                  margin={graphMargin}
                  getX={(data) => data.group}
                  tooltipRenderer={tooltipRenderer}
                />
              )}
            </ParentSize>
          </Grid>
          <Grid size={{ md: 4 }}>
            <ParentSize style={{ width: "100%" }}>
              {({ width }) => (
                <BarStackGraph
                  data={severeData}
                  keys={["infected"]}
                  xScale={severeInfectionsXScale}
                  yScale={riskReductionYScale}
                  colorScale={colorScale}
                  width={width}
                  height={300}
                  margin={graphMargin}
                  getX={(data) => data.group}
                  tooltipRenderer={tooltipRenderer}
                />
              )}
            </ParentSize>
          </Grid>
          <Grid size={{ md: 4 }}>
            <Typography variant="body1">
              Placebo Risk of Severe Infection (PRSI){" "}
            </Typography>
            <Typography variant="h3">{placeboSevereRI.toFixed(4)}%</Typography>
            <Typography variant="body1">
              Vaccine Risk of Severe Infection (VRSI){" "}
            </Typography>
            <Typography variant="h3">{vaccineSevereRI.toFixed(4)}%</Typography>
            <Typography variant="body1">
              Absolute Severe Risk Reduction (ASRR){" "}
            </Typography>
            <Typography variant="h3">{ASRR.toFixed(2)}%</Typography>
            <Typography variant="body1">
              Relative Severe Risk Reduction (RSRR)
            </Typography>
            <Typography variant="h3">{RSRR.toFixed(2)}%</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
