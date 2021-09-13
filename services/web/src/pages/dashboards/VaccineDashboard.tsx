import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { BarStackHorizontalGraph } from "@components/Common/Graph/BarStackHorizontalGraph";
import { StatAccordion } from "@components/Common/StatAccordion";
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
  Covid19ADRs,
  CovidWHOWorldData,
} from "@econnessione/shared/endpoints/graph.endpoints";
import { WHOCovid19GlobalData } from "@io/http/covid/COVIDDailyDatum";
import { VaccineDistributionDatum } from "@io/http/covid/VaccineDistributionDatum";
import { Grid, Tab, Tabs, Typography } from "@material-ui/core";
import { jsonData } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { isAfter, isBefore } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types";
import React from "react";

const infectedColor = "#bd0303";
const healthyColor = "#43e5a2";
const LAST_DAY_2020 = new Date("2020-12-31");
const LAST_DAY_2021 = new Date("2021-12-31");

export const background = "#eaedff";
const populationNumber = 8 * 10e8;

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

    return (
      <WithQueries
        queries={{
          whoData: jsonData(
            t.strict({ data: nonEmptyArray(WHOCovid19GlobalData) }).decode
          ),
          distribution: jsonData(
            t.strict({ data: nonEmptyArray(VaccineDistributionDatum) }).decode
          ),
        }}
        params={{
          distribution: { id: Covid19WorldVaccineDistribution.value },
          whoData: {
            id: CovidWHOWorldData.value,
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({
            distribution: { data: distribution },
            whoData: { data: whoData },
          }) => {
            const { vaccineADRTab } = this.state;

            // eslint-disable-next-line
            console.log(whoData);

            const byEqDate = pipe(
              D.Ord,
              Ord.contramap<Date, VaccineDistributionDatum>((d) => d.date)
            );

            const totalDistribution = pipe(
              distribution,
              A.sort(byEqDate),
              NEA.fromArray,
              O.fold(
                () => [],
                (data): VaccineDistributionDatum[] => {
                  const [init, ...rest] = data;
                  return pipe(
                    rest,
                    A.reduceWithIndex(NEA.of(init), (index, acc, e) => {
                      const last = NEA.last(acc);
                      const lastDate = index % 4 === 1 ? e.date : last.date;
                      return NEA.concat([
                        {
                          ...e,
                          date: lastDate,
                          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                          people_vaccinated:
                            last.people_vaccinated + e.people_vaccinated,
                          total_vaccinations:
                            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                            last.total_vaccinations + e.total_vaccinations,
                        },
                      ])(acc);
                    })
                  );
                }
              )
            );

            const covid2020TotalDeaths = pipe(
              whoData,
              A.findLast((w) => isBefore(w.Date_reported, LAST_DAY_2020)),
              O.fold(
                () => 0,
                (d) => d.Cumulative_deaths
              )
            );

            const covid2021TotalDeaths = pipe(
              whoData,
              A.findLast(
                (w) =>
                  isAfter(w.Date_reported, LAST_DAY_2020) &&
                  isBefore(w.Date_reported, LAST_DAY_2021)
              ),
              O.fold(
                () => 0,
                (d) => d.Cumulative_deaths - covid2020TotalDeaths
              )
            );
            // eslint-disable-next-line

            const deathRate2020 =
              (covid2020TotalDeaths / populationNumber) * 100;
            const deathRate2021 =
              (covid2021TotalDeaths / populationNumber) * 100;

            // const deathsXScale = scaleLinear<number>({
            //   domain: [0, populationNumber],
            //   nice: true,
            // });

            // const deathsYScale = scaleBand<string>({
            //   domain: deathsData.map((d) => d.year.toString()),
            //   padding: 0.5,
            // });

            // const deathsColor = scaleOrdinal<string, string>({
            //   domain: deathsKeys,
            //   range: [infectedColor, healthyColor],
            // });

            return (
              <Grid container style={{ background: "white", padding: 60 }}>
                <Grid container spacing={5} style={{ marginBottom: 40 }}>
                  <Grid container spacing={3} md={12}>
                    <Grid item md={3}>
                      <StatAccordion
                        caption="Deaths with Covid in 2020"
                        summary={covid2020TotalDeaths.toFixed(0)}
                        details={undefined}
                      />
                    </Grid>
                    <Grid item md={3}>
                      <StatAccordion
                        caption="Covid Death Rate in 2020 (%)"
                        summary={deathRate2020.toFixed(6)}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} md={12}>
                    <Grid item md={3}>
                      <StatAccordion
                        caption="Total deaths for Covid"
                        summary={covid2021TotalDeaths.toFixed(0)}
                        details={undefined}
                      />
                    </Grid>
                    <Grid item md={3}>
                      <StatAccordion
                        caption="Death Rate (%)"
                        summary={deathRate2021.toFixed(6)}
                      />
                    </Grid>
                  </Grid>
                  <Grid item md={12}>
                    <Tabs
                      value={vaccineADRTab}
                      onChange={(e, v) => {
                        this.setState({
                          vaccineADRTab: v,
                        });
                      }}
                    >
                      <Tab label="All" {...a11yProps(0)} />
                      <Tab label="VAERS" {...a11yProps(1)} />
                      <Tab label="EUDR" {...a11yProps(2)} />
                    </Tabs>
                    <TabPanel value={vaccineADRTab} index={0}>
                      <VaccineADRGraph
                        queries={{ data: { id: Covid19ADRs.value } }}
                        distribution={totalDistribution}
                      />
                    </TabPanel>
                    <TabPanel value={vaccineADRTab} index={1}>
                      <VaccineADRGraph
                        queries={{ data: { id: Covid19VAERS.value } }}
                        distribution={distribution.filter(
                          (d) => d.iso_code === "USA"
                        )}
                      />
                    </TabPanel>
                    <TabPanel value={vaccineADRTab} index={2}>
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
                    {/* <Grid item md={8}>
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
                                    <div style={{ color: deathsColor(key) }}>
                                      {key}: ({(data as any)[key]})
                                    </div>
                                  );
                                }}
                              />
                            );
                          }}
                        </ParentSize>
                      </Grid> */}
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
