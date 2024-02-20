import { type Forecast } from "@liexp/shared/lib/io/http/climate-change/Forecast.js";
import {
  ClimateChangeForecast,
  ClimateChangeHistoryOfSummits,
} from "@liexp/shared/lib/io/http/graphs/Graph.js";
import { numTicksForWidth } from "@liexp/shared/lib/utils/graph.utils.js";
import { AxisBottom } from "@visx/axis";
import { curveBasis, curveBasisOpen } from "@visx/curve";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import { Text } from "@visx/text";
import { Threshold } from "@visx/threshold";
import { Tooltip, defaultStyles, withTooltip } from "@visx/tooltip";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import * as React from "react";
import { useJSONClient } from "../../../hooks/useJSONAPI.js";
import { useJSONDataQuery } from "../../../state/queries/DiscreteQueries.js";
import QueriesRenderer from "../../QueriesRenderer.js";

const tooltipStyles = {
  ...defaultStyles,
  border: "1px solid white",
  color: "white",
};

interface TooltipData extends Forecast {
  lowerY: number;
  higherY: number;
}

interface EventDatum {
  label: string;
  year: number;
}

export interface SocietyCollapseForecastGraphProps {
  data: Forecast[];
  points: Array<{
    year: number;
    gtCO2: number;
  }>;
  events: EventDatum[];
  style?: React.CSSProperties;
  width: number;
  height: number;
}

export const SocietyCollapseForecastGraph = withTooltip<
  SocietyCollapseForecastGraphProps,
  TooltipData
>(
  ({
    width,
    height,
    data,
    points,
    events,
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }) => {
    const margin = { left: 0, right: 0, bottom: 30, top: 30 };
    // bounds
    const maxX = width - margin.left - margin.right;
    const maxY = height - margin.top - margin.bottom;
    // scales
    const yearDomain = [1970, 2060];

    const gtCO2Scale = React.useMemo(
      () =>
        scaleLinear({
          range: [0, maxY],
          domain: [180, -20],
        }),
      [maxY],
    );

    const yearScale = React.useMemo(
      () =>
        scaleLinear({
          range: [0, maxX],
          domain: yearDomain,
          nice: true,
        }),
      [maxX],
    );

    const backgroundId = `background-new-id`;

    const handleTooltip = React.useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x, y } = localPoint(event) ?? { x: 0, y: 0 };
        const x0 = yearScale.invert(x);
        const y0 = gtCO2Scale.invert(y);

        const tooltipData = pipe(
          data,
          A.filterMap((d) =>
            pipe(
              d.year === Math.round(x0) ? d : null,
              O.fromNullable,
              O.filter((gt) => gt.high >= y0 && y0 >= gt.low),
              O.map((gt) => ({
                ...d,
                lowerY: Math.round(gtCO2Scale(gt.low) ?? 0),
                higherY: Math.round(gtCO2Scale(gt.high) ?? 0),
              })),
            ),
          ),
        )[0];

        showTooltip({
          tooltipData,
          tooltipLeft: x,
          tooltipTop: tooltipData?.higherY ?? 0,
        });
      },
      [showTooltip, yearScale, gtCO2Scale],
    );

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
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => {
              hideTooltip();
            }}
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
                <Threshold<Forecast>
                  id={`${Math.random()}`}
                  data={data}
                  x={(d) => yearScale(d.year) ?? 0}
                  y0={(d) =>
                    gtCO2Scale(d.low) ??
                    gtCO2Scale(d.median) ??
                    gtCO2Scale(d.high) ??
                    0
                  }
                  y1={(d) => gtCO2Scale(d.high ?? d.median ?? d.low) ?? 0}
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
                  data={data}
                  x={(d) => yearScale(d.year) ?? 0}
                  y={(d) => gtCO2Scale(d.high) ?? 0}
                  stroke={`url('#${linePathId}')`}
                  strokeWidth={2}
                  curve={curveBasis}
                />
                {/* Median line */}
                {datum.id === "Historical" ? (
                  <LinePath
                    data={data}
                    x={(d) => yearScale(d.year) ?? 0}
                    y={(d) => gtCO2Scale(d.median) ?? 0}
                    stroke={`url('#${linePathId}')`}
                    strokeWidth={2}
                    curve={curveBasisOpen}
                  />
                ) : null}

                {/* Low Line */}
                <LinePath
                  data={data}
                  x={(d) => yearScale(d.year) ?? 0}
                  y={(d) => gtCO2Scale(d.low) ?? 0}
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

          {events.map((e, i) => {
            const x = yearScale(e.year) ?? 0;

            return (
              <Group key={e.label}>
                <Line
                  key={i}
                  x={yearScale(e.year)}
                  y={0}
                  stroke={`#000`}
                  strokeWidth={1}
                  from={{ x, y: height / 2 - i * 5 }}
                  to={{ x, y: height }}
                />
                <Text
                  x={x + 5}
                  y={height / 2 - i * 5}
                  width={50}
                  verticalAnchor="start"
                  style={{
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: 12,
                  }}
                >
                  {e.label}
                </Text>
              </Group>
            );
          })}

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
                          {
                            // eslint-disable-next-line @typescript-eslint/no-base-to-string
                            tick.value.toString()
                          }
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
        {tooltipData &&
          pipe(tooltipData, (td) => {
            return (
              <div>
                <Tooltip
                  top={td.higherY - 20}
                  left={tooltipLeft + 12}
                  style={{
                    ...tooltipStyles,
                    backgroundColor: td.upperColor,
                    borderColor: td.upperColor,
                  }}
                >
                  {td.id} {Math.round(td.high)} GT CO2
                </Tooltip>
                <Tooltip
                  top={td.lowerY + 20}
                  left={tooltipLeft + 12}
                  style={{
                    ...tooltipStyles,
                    backgroundColor: td.lowerColor,
                    borderColor: td.lowerColor,
                  }}
                >
                  {td.id} {Math.round(td.low)} GT CO2
                </Tooltip>
              </div>
            );
          })}
      </div>
    );
  },
);

export class SocietyCollapseForecastGraphContainer extends React.PureComponent {
  render(): JSX.Element {
    const jsonClient = useJSONClient();

    return pipe(
      <QueriesRenderer
        queries={{
          data: useJSONDataQuery(jsonClient)(
            t.strict({ data: t.array(ClimateChangeForecast.types[1]) }).decode,
            "climate-change/forecast.csv",
          ),
          events: useJSONDataQuery(jsonClient)(
            t.strict({ data: t.array(ClimateChangeHistoryOfSummits.types[1]) })
              .decode,
            "climate-change/history-of-climate-summits.csv",
          ),
        }}
        render={({ events, data }) => {
          return (
            <ParentSize
              style={{ height: 600, width: "100%" }}
              debounceTime={30}
            >
              {({ width, height }) => {
                return (
                  <SocietyCollapseForecastGraph
                    width={width}
                    height={height}
                    data={data.data}
                    events={events.data}
                    points={[
                      {
                        year: 2021,
                        gtCO2: 50,
                      },
                    ]}
                  />
                );
              }}
            </ParentSize>
          );
        }}
      />,
    );
  }
}
