import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { VaccineDatum } from "@io/http/covid/VaccineDatum";
import { VaccineDistributionDatum } from "@io/http/covid/VaccineDistributionDatum";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { jsonData } from "@providers/DataProvider";
import { AxisBottom, AxisLeft, AxisRight } from "@vx/axis";
import { curveBasis } from "@vx/curve";
import { LinearGradient } from "@vx/gradient";
import { Group } from "@vx/group";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleLinear } from "@vx/scale";
import { Bar, LinePath } from "@vx/shape";
import { Accessor } from "@vx/shape/lib/types";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { differenceInDays } from "date-fns";
import * as t from "io-ts";
import * as React from "react";

const now = new Date();
const populationNumber = 9 * 10e8;

const getReportX: Accessor<VaccineDatum, number> = (d) => {
  return differenceInDays(d.date, now);
};

const getDistributionX: Accessor<VaccineDistributionDatum, number> = (d) => {
  return differenceInDays(d.date, now);
};

const getDistributionY: Accessor<VaccineDistributionDatum, number> = (d) => {
  return d.cumulativeFirstDoses;
};

const adrReportRate100 = 100;
const adrReportRate10 = 10;
const adrReportRate1 = 1;

export class VaccineADRGraph extends React.PureComponent {
  state = {
    adrReportRate: adrReportRate100,
  };

  handleADRReportRateChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ): void => {
    this.setState({
      adrReportRate: event.target.value,
    });
  };

  render(): JSX.Element {
    const backgroundId = "vaccines-graph-background";
    const vaersLineId = "vaers-vaccines-line";
    const eudrvigilanceLineId = "eudrvigilance-moderna-vaccines-line";

    // distribution
    const europeVaccineDistributionFirstDoseLineId =
      "europe-vaccine-distribution-first-dose-line";
    const europeVaccineDistributionSecondDoseLineId =
      "europe-vaccine-distribution-second-dose-line";

    return (
      <WithQueries
        queries={{
          // vaers: jsonData(t.strict({ data: t.array(VaccineDatum) }).decode),
          eudrvigilance: jsonData(
            t.strict({ data: t.array(VaccineDatum) }).decode
          ),
          europeVaccineDistribution: jsonData(
            t.strict({ data: t.array(VaccineDistributionDatum) }).decode
          ),
        }}
        params={{
          // vaers: { id: "vaers" },
          eudrvigilance: { id: "eudrvigilance" },
          europeVaccineDistribution: { id: "europe-vaccine-distribution" },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({
            // vaers: { data: vaers },
            eudrvigilance: { data: eudrvigilance },
            europeVaccineDistribution: { data: europeVaccineDistribution },
          }) => {
            const xScaleDomain = [
              differenceInDays(new Date("2020-12-20"), new Date()),
              0,
            ];
            const xScale = scaleLinear<number>({
              domain: xScaleDomain,
            });

            const rateFactor = 100 / this.state.adrReportRate;
            const yScaleDomain = [
              0,
              eudrvigilance[eudrvigilance.length - 1].cumulativeDeaths *
                rateFactor,
            ];

            const getReportY: Accessor<VaccineDatum, number> = (d) =>
              d.cumulativeDeaths * rateFactor;
            const yLeftScale = scaleLinear<number>({
              domain: yScaleDomain,
            });

            const yRightScaleDomain = [
              0,
              europeVaccineDistribution[europeVaccineDistribution.length - 1]
                .cumulativeFirstDoses,
            ];

            const yRightScale = scaleLinear<number>({
              domain: yRightScaleDomain,
            });

            const totalDeaths = yScaleDomain[1];
            const totalFirstDoses = yRightScaleDomain[1];
            const deathRate = totalDeaths / totalFirstDoses;
            const estimatedDeaths = deathRate * populationNumber;
            const totalADRs =
              eudrvigilance[eudrvigilance.length - 1].cumulativeInjuries;
            const ADRRatio = totalADRs / totalFirstDoses;

            return (
              <Grid container spacing={3}>
                <Typography variant="h1">Vaccine ADR Graph</Typography>
                <Grid item md={8}>
                  <Box style={{ marginBottom: 20, position: "relative" }}>
                    <FormControl style={{ minWidth: 100 }}>
                      <InputLabel id="demo-simple-select-label">
                        ADR Rate %
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={this.state.adrReportRate}
                        onChange={this.handleADRReportRateChange}
                      >
                        <MenuItem value={adrReportRate100}>100%</MenuItem>
                        <MenuItem value={adrReportRate10}>10%</MenuItem>
                        <MenuItem value={adrReportRate1}>1%</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <ParentSize style={{ width: "100%" }}>
                    {({ width }) => {
                      const height = 500;

                      const margin = {
                        top: 80,
                        right: 80,
                        bottom: 80,
                        left: 80,
                      };
                      const xMax = width - margin.left - margin.right;
                      const yMax = height - margin.top - margin.bottom;

                      xScale.rangeRound([0, xMax]);
                      yLeftScale.rangeRound([yMax, 0]);
                      yRightScale.rangeRound([yMax, 0]);

                      return (
                        <svg width={width} height={height}>
                          <LinearGradient
                            id={backgroundId}
                            vertical={true}
                            from={"#177"}
                            to={"#177ffc"}
                            fromOpacity={1}
                            toOpacity={0.5}
                          />
                          {/** VAERS Line */}
                          <LinearGradient
                            id={vaersLineId}
                            vertical={true}
                            fromOpacity={1}
                            toOpacity={1}
                            to="#fcc317"
                            from="#fc2317"
                            fromOffset="40%"
                            toOffset="80%"
                          />
                          {/** EUDRVIGILANCE */}
                          <LinearGradient
                            id={eudrvigilanceLineId}
                            vertical={true}
                            fromOpacity={1}
                            toOpacity={1}
                            to="#317"
                            from="#642b17"
                            fromOffset="40%"
                            toOffset="80%"
                          />
                          {/** VACCINE DISTRIBUTION - First dose */}
                          <LinearGradient
                            id={europeVaccineDistributionFirstDoseLineId}
                            vertical={true}
                            fromOpacity={1}
                            toOpacity={1}
                            to="#67be2a"
                            from="#67be2a"
                            fromOffset="40%"
                            toOffset="80%"
                          />
                          <LinearGradient
                            id={europeVaccineDistributionSecondDoseLineId}
                            vertical={true}
                            fromOpacity={1}
                            toOpacity={1}
                            to="#67be65"
                            from="#67be65"
                            fromOffset="40%"
                            toOffset="80%"
                          />
                          {/** And are then referenced for a style attribute. */}
                          <Bar
                            fill={`url(#${backgroundId})`}
                            x={0}
                            y={0}
                            width={width}
                            height={500}
                            stroke="#ffffff"
                            strokeWidth={0}
                            rx={0}
                          />
                          <Group top={margin.top} left={margin.left}>
                            <LinePath
                              data={eudrvigilance}
                              x={(d) => xScale(getReportX(d)) ?? 0}
                              y={(d) => yLeftScale(getReportY(d)) ?? 0}
                              stroke={`url('#${eudrvigilanceLineId}')`}
                              strokeWidth={4}
                              shapeRendering="geometricPrecision"
                              curve={curveBasis}
                            />
                            <LinePath
                              data={europeVaccineDistribution}
                              x={(d) => xScale(getDistributionX(d)) ?? 0}
                              y={(d) => yRightScale(getDistributionY(d)) ?? 0}
                              stroke={`url('#${europeVaccineDistributionFirstDoseLineId}')`}
                              strokeWidth={4}
                              curve={curveBasis}
                              shapeRendering="geometricPrecision"
                            />
                            <LinePath
                              data={europeVaccineDistribution}
                              x={(d) => xScale(getDistributionX(d)) ?? 0}
                              y={(d) =>
                                yRightScale(d.cumulativeSecondDoses) ?? 0
                              }
                              stroke={`url('#${europeVaccineDistributionSecondDoseLineId}')`}
                              strokeWidth={4}
                              curve={curveBasis}
                              shapeRendering="geometricPrecision"
                            />
                            <AxisLeft scale={yLeftScale} label="Deaths" />
                            <AxisRight
                              scale={yRightScale}
                              left={xMax}
                              label="Vaccine Distribution (million)"
                              tickFormat={(d) =>
                                (d.valueOf() / 10e5).toString()
                              }
                            />
                            <AxisBottom
                              top={yMax}
                              scale={xScale}
                              label="Date"
                            />
                          </Group>
                        </svg>
                      );
                    }}
                  </ParentSize>
                </Grid>
                <Grid item md={4}>
                  <Box>
                    <Typography variant="body1">
                      Total ADRs at current date {totalADRs}{" "}
                      {ADRRatio.toFixed(4)}%
                    </Typography>
                    <Typography variant="body1">
                      Total deaths at current date {totalDeaths}
                    </Typography>
                    <Typography variant="body1">
                      Total first doses at current date {totalFirstDoses}
                    </Typography>
                    <Typography variant="body1">
                      Death rate ({totalDeaths} / {totalFirstDoses}) * 100{" "}
                    </Typography>
                    <Typography variant="h2">
                      {deathRate.toFixed(6)}%
                    </Typography>
                    <Typography variant="body1">
                      Deaths estimation ({deathRate} * {populationNumber}) ={" "}
                      {estimatedDeaths}
                    </Typography>
                    <Typography variant="h2">
                      {estimatedDeaths.toFixed(0)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            );
          }
        )}
      />
    );
  }
}
