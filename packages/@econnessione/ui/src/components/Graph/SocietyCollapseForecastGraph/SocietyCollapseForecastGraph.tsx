import { jsonData } from "@econnessione/shared/providers/DataProvider";
import { numTicksForWidth } from "@econnessione/shared/utils/graph.utils";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyLoader } from "@econnessione/ui/components/Common/Loader";
import { AxisBottom } from "@vx/axis";
import { curveBasis, curveBasisOpen } from "@vx/curve";
import { localPoint } from "@vx/event";
import { LinearGradient } from "@vx/gradient";
import { Group } from "@vx/group";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleLinear } from "@vx/scale";
import { Bar, Line, LinePath } from "@vx/shape";
import { Text } from "@vx/text";
import { Threshold } from "@vx/threshold";
import { defaultStyles, Tooltip, withTooltip } from "@vx/tooltip";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import * as React from "react";

const tooltipStyles = {
  ...defaultStyles,
  border: "1px solid white",
  color: "white",
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

interface TooltipData extends Omit<CO2LevelDatum, "gtCO2"> {
  gtCO2: GTCO2Datum;
  lowerY: number;
  higherY: number;
}

interface EventDatum {
  label: string;
  year: number;
}

export interface SocietyCollapseForecastGraphProps {
  data: CO2LevelDatum[];
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
      [maxY]
    );

    const yearScale = React.useMemo(
      () =>
        scaleLinear({
          range: [0, maxX],
          domain: yearDomain,
          nice: true,
        }),
      [maxX]
    );

    const backgroundId = `background-new-id`;

    const handleTooltip = React.useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>
      ) => {
        const { x, y } = localPoint(event) ?? { x: 0, y: 0 };
        const x0 = yearScale.invert(x);
        const y0 = gtCO2Scale.invert(y);

        const tooltipData = pipe(
          data,
          A.filterMap((d) =>
            pipe(
              d.gtCO2.find((g) => g.year === Math.round(x0)),
              O.fromNullable,
              O.filter((gt) => {
                return gt.High >= y0 && y0 >= gt.Low;
              }),
              O.map((gt) => ({
                ...d,
                gtCO2: gt,
                lowerY: Math.round(gtCO2Scale(gt.Low) ?? 0),
                higherY: Math.round(gtCO2Scale(gt.High) ?? 0),
              }))
            )
          )
        )[0];

        showTooltip({
          tooltipData,
          tooltipLeft: x,
          tooltipTop: tooltipData?.higherY ?? 0,
        });
      },
      [showTooltip, yearScale, gtCO2Scale]
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
            onMouseLeave={() => hideTooltip()}
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
                    curve={curveBasisOpen}
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

          {events.map((e, i) => {
            const x = yearScale(e.year) ?? 0;

            return (
              <Group>
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
                  {td.id} {Math.round(td.gtCO2.High)} GT CO2
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
                  {td.id} {Math.round(td.gtCO2.Low)} GT CO2
                </Tooltip>
              </div>
            );
          })}
      </div>
    );
  }
);

export class SocietyCollapseForecastGraphContainer extends React.PureComponent {
  render(): JSX.Element {
    return pipe(
      <WithQueries
        queries={{
          data: jsonData(t.strict({ data: t.any }).decode),
          events: jsonData(t.strict({ data: t.any }).decode),
        }}
        params={{
          data: { id: "climate-change/forecast.csv" },
          events: { id: "climate-change/history-of-climate-summits.csv" },
        }}
        render={QR.fold(LazyLoader, ErrorBox, ({ events, data }) => {
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
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    data={data.data as any}
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    events={events.data as any}
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
        })}
      />
    );
  }
}
