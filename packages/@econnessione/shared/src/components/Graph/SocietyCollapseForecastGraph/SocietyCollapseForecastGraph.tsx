import { numTicksForWidth } from "@utils/graph.utils";
import { AxisBottom } from "@vx/axis";
import { curveBasis } from "@vx/curve";
// import { localPoint } from "@vx/event";
import { LinearGradient } from "@vx/gradient";
import { Group } from "@vx/group";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleLinear } from "@vx/scale";
import { Bar, Line, LinePath } from "@vx/shape";
import { Threshold } from "@vx/threshold";
// import { TooltipWithBounds, withTooltip } from "@vx/tooltip";
// import { WithTooltipProvidedProps } from "@vx/tooltip/lib/enhancers/withTooltip";
import * as A from "fp-ts/lib/Array";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import societyCollapseData from "./society-collapse-forecast.json";

interface Colors {
  lowerColor: string;
  upperColor: string;
}

const colors: { [key: string]: Colors } = {
  "AR5 BAU": { lowerColor: "#f45", upperColor: "#f45" },
  "Post-COVID-19": { lowerColor: "#555", upperColor: "#444" },
  "Pledges and Targets": { lowerColor: "#4ed", upperColor: "#4ed" },
  "Optimistic scenatio (net-zero targets)": {
    lowerColor: "#216",
    upperColor: "#216",
  },
  "2�C consistent": { lowerColor: "#25d", upperColor: "#25f" },
  "1.5�C consistent": { lowerColor: "green", upperColor: "green" },
  Historical: { lowerColor: "#000", upperColor: "#000" },
};

interface GTCO2Datum {
  year: number;
  Low: number;
  Median: number;
  High: number;
}

interface BoundDatum {
  lower?: number;
  median?: number;
  upper?: number;
}

interface CO2LevelDatum {
  id: string;
  label: string;
  lowerColor: string;
  upperColor: string;
  gtCO2: GTCO2Datum[];
  temp: {
    high: BoundDatum;
    low: BoundDatum;
  };
}

export interface SocietyCollapseForecastGraphProps {
  data: CO2LevelDatum[];
  points: Array<{
    year: number;
    gtCO2: number;
  }>;
  style?: React.CSSProperties;
}

export const SocietyCollapseForecastGraph: React.FC<SocietyCollapseForecastGraphProps> = ({
  data,
  points,
  style,
}) => {
  // const labelColor = "#8e205f";

  return (
    <ParentSize
      style={{ height: 600, width: "100%", ...style }}
      debounceTime={30}
    >
      {({ width, height }) => {
        const margin = { left: 0, right: 0, bottom: 30, top: 30 };
        // bounds
        const maxX = width - margin.left - margin.right;
        const maxY = height - margin.top - margin.bottom;
        // scales
        const yearDomain = [1990, 2100];

        const gtCO2Scale = scaleLinear({
          range: [0, maxY],
          domain: [180, -20],
        });

        const yearScale = scaleLinear({
          range: [0, maxX],
          domain: yearDomain,
          nice: true,
        });

        const backgroundId = `background-new-id`;
        return (
          <div style={{ height, width }}>
            <svg width={width} height={height}>
              {/** And are then referenced for a style attribute. */}
              <Bar
                fill={`url(#${backgroundId})`}
                x={0}
                y={0}
                width={width}
                height={height}
                stroke="#ffffff"
                strokeWidth={0}
                rx={0}
              />

              <LinearGradient id={backgroundId} from="#c30ff7" to="#fff" />
              {data.map((datum) => {
                const linePathId = `line-path-${datum.id}`;
                const areaPathId = `area-path-${datum.id}`;
                return [
                  <LinearGradient
                    key={linePathId}
                    id={linePathId}
                    from={datum.lowerColor}
                    to={datum.upperColor}
                    toOffset={"80%"}
                    vertical={false}
                    opacity={0.8}
                  />,
                  // area gradient,
                  <LinearGradient
                    key={areaPathId}
                    id={areaPathId}
                    from={datum.lowerColor}
                    to={datum.upperColor}
                    toOffset={"80%"}
                    vertical={false}
                    opacity={0.5}
                  />,
                ];
              })}

              {data.map((datum) => {
                const linePathId = `line-path-${datum.id}`;
                const areaPathId = `area-path-${datum.id}`;
                return (
                  <Group
                    key={datum.id}
                    top={margin.top}
                    left={margin.left}
                    width={width}
                    height={height}
                  >
                    <Threshold<GTCO2Datum>
                      id={`${Math.random()}`}
                      data={datum.gtCO2}
                      x={(d) => yearScale(d.year) ?? 0}
                      y0={(d) =>
                        gtCO2Scale(d.Low) ??
                        gtCO2Scale(d.Median) ??
                        gtCO2Scale(d.High) ??
                        0
                      }
                      y1={(d) => gtCO2Scale(d.High ?? d.Median ?? d.Low) ?? 0}
                      clipAboveTo={10}
                      clipBelowTo={maxY}
                      curve={curveBasis}
                      belowAreaProps={{
                        fill: `url('#${areaPathId}')`,
                        fillOpacity: 0.4,
                      }}
                      aboveAreaProps={{
                        fill: `url('#${areaPathId}')`,
                        fillOpacity: 0.4,
                      }}
                    />
                    {/* High line */}
                    <LinePath
                      data={datum.gtCO2}
                      x={(d) => yearScale(d.year) ?? 0}
                      y={(d) => gtCO2Scale(d.High) ?? 0}
                      stroke={`url('#${linePathId}')`}
                      strokeWidth={2}
                      curve={curveBasis}
                    />
                    {/* Median line */}
                    {datum.id === "Historical" ? (
                      <LinePath
                        data={datum.gtCO2}
                        x={(d) => yearScale(d.year) ?? 0}
                        y={(d) => gtCO2Scale(d.Median) ?? 0}
                        stroke={`url('#${linePathId}')`}
                        strokeWidth={2}
                        curve={curveBasis}
                      />
                    ) : null}

                    {/* Low Line */}
                    <LinePath
                      data={datum.gtCO2}
                      x={(d) => yearScale(d.year) ?? 0}
                      y={(d) => gtCO2Scale(d.Low) ?? 0}
                      stroke={`url('#${linePathId}')`}
                      strokeWidth={2}
                      curve={curveBasis}
                    />
                  </Group>
                );
              })}

              <Group>
                {points.map((p, i) => {
                  return (
                    <circle
                      key={i}
                      cx={yearScale(p.year)}
                      cy={gtCO2Scale(p.gtCO2)}
                      r={3}
                      fill={"black"}
                    />
                  );
                })}
              </Group>

              <AxisBottom
                top={height - margin.bottom}
                left={0}
                scale={yearScale}
                numTicks={numTicksForWidth(width)}
                label={"Years"}
              >
                {(axis) => {
                  const tickLabelSize = 8;
                  const tickRotate = 0;
                  const tickColor = "#000";
                  const axisCenter =
                    (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;
                  return (
                    <g className="my-custom-bottom-axis">
                      {axis.ticks.map((tick, i) => {
                        const tickX = tick.to.x;
                        const tickY =
                          tick.to.y + tickLabelSize + (axis.tickLength ?? 0);
                        return (
                          <Group
                            key={`vx-tick-${String(tick.value)}-${i}`}
                            className={"vx-axis-tick"}
                          >
                            <Line
                              from={tick.from}
                              to={tick.to}
                              stroke={tickColor}
                            />
                            <text
                              transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                              fontSize={tickLabelSize}
                              textAnchor="middle"
                              fill={tickColor}
                              fontFamily={"Arial"}
                            >
                              {tick.value}
                            </text>
                          </Group>
                        );
                      })}
                      <text
                        textAnchor="middle"
                        transform={`translate(${axisCenter}, 50)`}
                        fontSize="8"
                        fontFamily="Arial"
                        fill={tickColor}
                      >
                        {axis.label}
                      </text>
                    </g>
                  );
                }}
              </AxisBottom>
            </svg>
          </div>
        );
      }}
    </ParentSize>
  );
};

export class SocietyCollapseForecastGraphContainer extends React.PureComponent {
  render(): JSX.Element {
    return pipe(
      societyCollapseData as any,
      A.reduce(
        R.empty as Record<string, any>,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        (acc, { __1, GtCO2e, ...years }: any) => {
          if (!acc[__1]) {
            acc[__1] = {};
          }

          acc[__1] = Object.entries(years).reduce((acc1, [y, v]) => {
            const [first, second, third] = acc[__1][y] || [
              undefined,
              undefined,
              undefined,
            ];

            const value = v === "" ? undefined : v;
            return {
              ...acc1,
              [y]: [
                GtCO2e === "Low" ? value : first,
                GtCO2e === "Median" ? value : second,
                GtCO2e === "High" ? value : third,
              ],
            };
          }, {});

          return acc as any;
        }
      ),
      (record): SocietyCollapseForecastGraphProps => {
        const data = Object.entries(record).map(([key, value]) => {
          const gtCO2Entries = (Object.entries(value).filter(
            ([_, values]) =>
              ((values as any) as any[]).filter((v) => v !== undefined).length >
              0
          ) as any) as Array<[string, any[]]>;

          return {
            id: key,
            ...colors[key],
            label: key,
            gtCO2: gtCO2Entries.map(([year, values]) => ({
              year: parseInt(year, 10),
              Low: values[0],
              Median: values[1],
              High: values[2],
            })),
            temp: {
              high: { lower: 1, median: 1, upper: 1 },
              low: { lower: 1, median: 1, upper: 1 },
            },
          };
        });

        return {
          data,
          points: [
            {
              year: 2021,
              gtCO2: 50,
            },
          ],
        };
      },
      (props) => <SocietyCollapseForecastGraph {...props} />
    );
  }
}
