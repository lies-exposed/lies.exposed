import { BarStackHorizontalGraph } from "@components/Common/Graph/BarStackHorizontalGraph";
import { VaccineADRGraph } from "@components/Graph/covid/vaccines/VaccineADRGraph";
import { VaccineEffectivenessIndicators } from "@components/Graph/covid/vaccines/VaccineEffectivenessIndicators";
import { Grid, Typography } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import React from "react";

const infectedColor = "#bd0303";
const healthyColor = "#43e5a2";

export const background = "#eaedff";
const populationNumber = 9 * 10e8;
const deathsData = [
  {
    covid: 3 * 10e5,
    total: populationNumber,
    year: 2020,
  },
];

export class VaccineDashboard extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    // deaths
    const deathsKeys = ["covid", "total"];
    const totalDeathsForCovid = deathsData[0].covid;
    const deathRate = totalDeathsForCovid / populationNumber;
    const deathsXScale = scaleLinear<number>({
      domain: [0, populationNumber],
      nice: true,
    });
    const deathsYScale = scaleBand<string>({
      domain: deathsData.map((d) => d.year.toString()),
      padding: 0.5,
    });

    const deathsColor = scaleOrdinal<string, string>({
      domain: deathsKeys,
      range: [infectedColor, healthyColor],
    });

    return (
      <Grid container style={{ background: "white", padding: 60 }}>
        <Grid container spacing={5} style={{ marginBottom: 40 }}>
          <Grid item md={12}>
            <VaccineADRGraph />
          </Grid>
          <Grid item md={12}>
            <VaccineEffectivenessIndicators />
          </Grid>
          <Grid item md={12}>
            <Typography variant="h1">Covid fatalities</Typography>
            <Grid container spacing={3}>
              <Grid item md={8}>
                <ParentSize style={{ width: "100%" }}>
                  {({ width }) => {
                    return (
                      <BarStackHorizontalGraph
                        width={width}
                        height={200}
                        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
                        data={deathsData}
                        keys={deathsKeys}
                        xScale={deathsXScale}
                        yScale={deathsYScale}
                        colorScale={deathsColor}
                        getY={(d) => d.year.toString()}
                        tooltipRenderer={({ key, bar: { data } }) => {
                          return (
                            <>
                              <div style={{ color: deathsColor(key) }}>
                                {key}: ({(data as any)[key]})
                              </div>
                            </>
                          );
                        }}
                      />
                    );
                  }}
                </ParentSize>
              </Grid>
              <Grid item md={4}>
                <Typography variant="body1">
                  total deaths for covid since 2020
                </Typography>
                <Typography variant="h4">{totalDeathsForCovid}</Typography>
                <Typography variant="body1">
                  total population {populationNumber}
                </Typography>
                <Typography variant="body1">Death rate</Typography>
                <Typography variant="h3">{deathRate.toFixed(6)}%</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
