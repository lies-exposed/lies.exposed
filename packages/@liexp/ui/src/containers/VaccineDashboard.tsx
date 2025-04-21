import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { type VaccineDistributionDatum } from "@liexp/shared/lib/io/http/covid/VaccineDistributionDatum.js";
import {
  Covid19ADRs,
  Covid19EUDR,
  Covid19VAERS,
  Covid19WorldVaccineDistribution,
  CovidWHOWorldData,
} from "@liexp/shared/lib/io/http/graphs/Graph.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import { scaleOrdinal } from "@visx/scale";
import { isAfter, isBefore } from "date-fns";
import { Schema } from "effect";
import * as D from "fp-ts/lib/Date.js";
import { type Some } from "fp-ts/lib/Option.js";
import * as React from "react";
import { StatAccordion } from "../components/Common/StatAccordion.js";
import { a11yProps, TabPanel } from "../components/Common/TabPanel.js";
import { VaccineADRGraph } from "../components/Graph/covid/vaccines/VaccineADRGraph.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Box, Grid, Tab, Tabs, Typography } from "../components/mui/index.js";
import { useJSONClient } from "../hooks/useJSONAPI.js";
import { useJSONDataQuery } from "../state/queries/DiscreteQueries.js";
import { useNavigateTo } from "../utils/history.utils.js";

const LAST_DAY_2020 = new Date("2020-12-31");
const LAST_DAY_2021 = new Date("2021-12-31");

// const infectedColor = "#bd0303";
// const healthyColor = "#43e5a2";

const colorDomain = [
  "#FF0000",
  "#FF1100",
  "#FF2200",
  "#FF3300",
  "#FF4400",
  "#FF5500",
  "#FF6600",
  "#FF7700",
  "#FF8800",
  "#FF9900",
  "#FFAA00",
  "#FFBB00",
  "#FFCC00",
  "#FFDD00",
  "#FFEE00",
  "#FFFF00",
  "#EEFF00",
  "#DDFF00",
  "#CCFF00",
  "#BBFF00",
  "#AAFF00",
  "#99FF00",
  "#88FF00",
  "#77FF00",
  "#66FF00",
  "#55FF00",
  "#44FF00",
  "#33FF00",
  "#22FF00",
  "#11FF00",
  "#00FF00",
];

const byEqDate = pipe(
  D.Ord,
  fp.Ord.contramap<Date, VaccineDistributionDatum>((d) => d.date),
);

const getColorByRange = (
  amount: number,
  range: [number, number],
  reverse?: boolean,
): string => {
  const delta = (range[1] - range[0]) / 30;

  const domain = fp.A.range(0, 30).reduce(
    (acc, v) => acc.concat(v * delta),
    [] as number[],
  );

  const colorScaleV2 = scaleOrdinal({
    range: colorDomain,
    domain,
    reverse: reverse ?? false,
  });
  // const colorScale = scaleBand<string>({
  //   range: range,
  //   domain: colorDomain,
  // });

  const color = colorScaleV2(amount);
  return color;
};

export const background = "#eaedff";
const populationNumber = 8 * 10e8;

interface VaccineDashboardProps {
  adrTab?: number;
}

const VaccineDashboard: React.FC<VaccineDashboardProps> = ({ adrTab = 0 }) => {
  // deaths
  // const deathsKeys = ["covid", "total"];

  const navigateTo = useNavigateTo();
  const jsonClient = useJSONClient();

  return (
    <QueriesRenderer
      queries={{
        whoData: useJSONDataQuery(jsonClient)(
          (u) =>
            Schema.decodeUnknownEither(
              Schema.Struct({ data: CovidWHOWorldData.members[1] }),
            )(u),
          CovidWHOWorldData.members[0].literals[0],
        ),
        distribution: useJSONDataQuery(jsonClient)(
          Schema.decodeUnknownEither(
            Schema.Struct({ data: Covid19WorldVaccineDistribution.members[1] }),
          ),
          Covid19WorldVaccineDistribution.members[0].literals[0],
        ),
      }}
      render={({
        distribution: { data: distribution },
        whoData: { data: whoData },
      }) => {
        const totalDistribution = pipe(
          [...distribution],
          fp.A.sort(byEqDate),
          fp.O.fromPredicate(isNonEmpty),
          fp.O.fold(
            () => [],
            (data): readonly VaccineDistributionDatum[] => {
              const [init, ...rest] = data;
              return pipe(
                rest,
                fp.A.fromArray,
                fp.A.reduceWithIndex(
                  [init] as readonly VaccineDistributionDatum[],
                  (index, acc, e) => {
                    const last = fp.A.last(
                      acc,
                    ) as Some<VaccineDistributionDatum>;
                    const lastDate = index % 4 === 1 ? e.date : last.value.date;
                    return fp.A.concat([
                      {
                        ...e,
                        date: lastDate,
                        people_vaccinated:
                          last.value.people_vaccinated + e.people_vaccinated,
                        total_vaccinations:
                          last.value.total_vaccinations + e.total_vaccinations,
                      } as VaccineDistributionDatum,
                    ])(acc);
                  },
                ),
              );
            },
          ),
        );

        const covid2020TotalDeaths = pipe(
          whoData,
          fp.A.findLast((w) => isBefore(w.Date_reported, LAST_DAY_2020)),
          fp.O.fold(
            () => 0,
            (d) => d.Cumulative_deaths,
          ),
        );

        const covid2021TotalDeaths = pipe(
          whoData,
          fp.A.findLast(
            (w) =>
              isAfter(w.Date_reported, LAST_DAY_2020) &&
              isBefore(w.Date_reported, LAST_DAY_2021),
          ),
          fp.O.fold(
            () => 0,
            (d) => d.Cumulative_deaths - covid2020TotalDeaths,
          ),
        );

        const deathRate2020 = (covid2020TotalDeaths / populationNumber) * 100;
        const immunityRate2020 = 100 - deathRate2020;
        const deathRate2021 = (covid2021TotalDeaths / populationNumber) * 100;
        const immunityRate2021 = 100 - deathRate2021;

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
                    style={{
                      summary: {
                        color: getColorByRange(
                          covid2020TotalDeaths,
                          [0, 2e5],
                          true,
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item md={3}>
                  <StatAccordion
                    caption="Covid Death Rate in 2020 (%)"
                    summary={deathRate2020.toFixed(6)}
                    style={{
                      summary: {
                        color: getColorByRange(
                          deathRate2020,
                          [0.02, 0.5],
                          true,
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item md={6}>
                  <StatAccordion
                    caption="Immunity Rate (%)"
                    summary={immunityRate2020.toFixed(2)}
                    style={{
                      summary: {
                        color: getColorByRange(immunityRate2020, [0, 100]),
                      },
                    }}
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
                <Grid item md={6}>
                  <StatAccordion
                    caption="Immunity Rate (%)"
                    summary={immunityRate2021.toFixed(2)}
                  />
                </Grid>
              </Grid>
              <Grid item md={12}>
                <Box display="flex">
                  <Typography variant="h2">Vaccine ADR Graph</Typography>
                </Box>
                <Tabs
                  value={adrTab}
                  onChange={(e, v) => {
                    navigateTo.navigateTo("/dashboard/covid19-vaccines", {
                      adrTab: v,
                    });
                  }}
                >
                  <Tab label="All" {...a11yProps(0)} />
                  <Tab label="VAERS" {...a11yProps(1)} />
                  <Tab label="EUDR" {...a11yProps(2)} />
                </Tabs>
                <TabPanel value={adrTab} index={0}>
                  <VaccineADRGraph
                    id={Covid19ADRs.members[0].literals[0]}
                    distribution={totalDistribution}
                  />
                </TabPanel>
                <TabPanel value={adrTab} index={1}>
                  <VaccineADRGraph
                    id={Covid19VAERS.members[0].literals[0]}
                    distribution={distribution.filter(
                      (d) => d.iso_code === "USA",
                    )}
                  />
                </TabPanel>
                <TabPanel value={adrTab} index={2}>
                  <VaccineADRGraph
                    id={Covid19EUDR.members[0].literals[0]}
                    distribution={distribution.filter(
                      (d) => d.iso_code === "OWID_EUR",
                    )}
                  />
                </TabPanel>
              </Grid>
              {/* <Grid item md={12}>
                    <VaccineEffectivenessIndicators />
                  </Grid> */}
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
      }}
    />
  );
};

export default VaccineDashboard;
