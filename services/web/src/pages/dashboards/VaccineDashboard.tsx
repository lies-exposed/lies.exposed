import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { BarStackHorizontalGraph } from "@components/Common/Graph/BarStackHorizontalGraph";
import { VaccineADRGraph } from "@components/Graph/covid/vaccines/VaccineADRGraph";
import { VaccineEffectivenessIndicators } from "@components/Graph/covid/vaccines/VaccineEffectivenessIndicators";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/shared/components/Common/TabPanel";
import {
  Covid19EUDR,
  Covid19WorldVaccineDistribution,
  Covid19VAERS,
} from "@econnessione/shared/endpoints/graph.endpoints";
import { VaccineDistributionDatum } from "@io/http/covid/VaccineDistributionDatum";
import { Grid, Tab, Tabs, Typography } from "@material-ui/core";
import { jsonData } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as t from "io-ts";
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

interface VaccineDashboardState {
  vaccineADRTab: number;
}

export class VaccineDashboard extends React.PureComponent<
  RouteComponentProps,
  VaccineDashboardState
> {
  state = { vaccineADRTab: 0 };
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
      <WithQueries
        queries={{
          distribution: jsonData(
            t.strict({ data: t.array(VaccineDistributionDatum) }).decode
          ),
        }}
        params={{ distribution: { id: Covid19WorldVaccineDistribution.value } }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ distribution: { data: distribution } }) => {
            const { vaccineADRTab } = this.state;
            return (
              <Grid container style={{ background: "white", padding: 60 }}>
                <Grid container spacing={5} style={{ marginBottom: 40 }}>
                  <Grid item md={12}>
                    <Tabs
                      value={vaccineADRTab}
                      onChange={(e, v) => {
                        this.setState({
                          vaccineADRTab: v,
                        });
                      }}
                    >
                      <Tab label="VAERS" {...a11yProps(0)} />
                      <Tab label="EUDR" {...a11yProps(1)} />
                    </Tabs>
                    <TabPanel value={vaccineADRTab} index={0}>
                      <VaccineADRGraph
                        queries={{ data: { id: Covid19VAERS.value } }}
                        distribution={distribution.filter(
                          (d) => d.iso_code === "USA"
                        )}
                      />
                    </TabPanel>
                    <TabPanel value={vaccineADRTab} index={1}>
                      <VaccineADRGraph
                        queries={{ data: { id: Covid19EUDR.value } }}
                        distribution={distribution.filter(
                          (d) => d.iso_code === "OWID_EUR"
                        )}
                      />
                    </TabPanel>
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
                                margin={{
                                  top: 60,
                                  right: 60,
                                  bottom: 60,
                                  left: 60,
                                }}
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
                        <Typography variant="h4">
                          {totalDeathsForCovid}
                        </Typography>
                        <Typography variant="body1">
                          total population {populationNumber}
                        </Typography>
                        <Typography variant="body1">Death rate</Typography>
                        <Typography variant="h3">
                          {deathRate.toFixed(6)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            );
          }
        )}
      />
    );
  }
}
