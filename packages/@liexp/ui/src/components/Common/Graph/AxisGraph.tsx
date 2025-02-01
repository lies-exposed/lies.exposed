import {
  numTicksForHeight,
  numTicksForWidth,
} from "@liexp/shared/lib/utils/graph.utils.js";
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { curveLinear } from "@visx/curve";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Bar, Line, LinePath } from "@visx/shape";
import * as React from "react";
// accessors

export interface AxisGraphProps<D> {
  id: string;
  background: (id: string) => React.ReactNode;
  linePathElement: (id: string) => React.ReactNode;
  width: number;
  height: number;
  data: D[];
  points?: { data: D[] };
  minXRange?: number;
  minYRange?: number;
  getX: (e: D) => number;
  axisLeftLabel: string;
  axisRightLabel: string;
  axisBottomLabel: string;
  getY: (e: D) => number;
  showPoints: boolean;
  showGrid: boolean;
  margin: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const AxisGraph = <D extends any>({
  id,
  data,
  points,
  width,
  height,
  margin,
  background,
  linePathElement,
  minXRange = 0,
  minYRange = 0,
  getX,
  getY,
  showGrid,
  showPoints,
  axisLeftLabel,
  axisRightLabel,
  axisBottomLabel,
}: AxisGraphProps<D>): React.JSX.Element => {
  // bounds
  const maxX = width - margin.left - margin.right;
  const maxY = height - margin.top - margin.bottom;

  // scales
  const xDomain = [Math.min(...data.map(getX)), Math.max(...data.map(getX))];

  const xScale = scaleLinear({
    range: [0, maxX],
    domain: xDomain,
  });

  const yDomain = [Math.min(...data.map(getY)), Math.max(...data.map(getY))];

  const yScale = scaleLinear({
    range: [maxY, 0],
    domain: yDomain,
    nice: true,
  });

  const linePathId = `line-path-${id}`;
  const backgroundId = `background-${id}`;

  const labelColor = "#8e205f";
  return (
    <svg width={width} height={height}>
      {background(backgroundId)}
      {linePathElement(linePathId)}

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

      {showGrid ? (
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={xScale}
          yScale={yScale}
          stroke="rgba(142, 32, 95, 0.9)"
          width={maxX}
          height={maxY}
          numTicksRows={numTicksForHeight(height)}
          numTicksColumns={numTicksForWidth(width)}
        />
      ) : null}
      <Group top={margin.top} left={margin.left}>
        <LinePath
          data={data}
          x={(d) => xScale(getX(d)) ?? 0}
          y={(d) => yScale(getY(d)) ?? 0}
          stroke={`url('#${linePathId}')`}
          strokeWidth={2}
          curve={curveLinear}
        />
        {points !== undefined
          ? points.data.map((d, i) => (
              <circle
                key={i}
                cx={xScale(getX(d))}
                cy={yScale(getY(d))}
                r={3}
                fill={"black"}
              />
            ))
          : null}
      </Group>
      <Group left={margin.left}>
        <AxisLeft
          top={margin.top}
          left={0}
          scale={yScale}
          hideZero
          numTicks={numTicksForHeight(height)}
          label={axisLeftLabel}
          labelProps={{
            fill: labelColor,
            textAnchor: "middle",
            fontSize: 12,
            fontFamily: "Arial",
          }}
          stroke="#1b1a1e"
          tickStroke="#8e205f"
          tickLabelProps={() => ({
            fill: labelColor,
            textAnchor: "end",
            fontSize: 10,
            fontFamily: "Arial",
            dx: "-0.25em",
            dy: "0.25em",
          })}
          tickComponent={({ formattedValue, ...tickProps }) => (
            <text {...tickProps}>{formattedValue}</text>
          )}
        />
        <AxisRight
          top={margin.top}
          left={maxX}
          scale={yScale}
          hideZero
          numTicks={numTicksForHeight(height)}
          label={axisRightLabel}
          labelProps={{
            fill: labelColor,
            textAnchor: "middle",
            fontSize: 10,
            fontFamily: "Arial",
          }}
          stroke="#1b1a1e"
          tickStroke="#8e205f"
          tickLabelProps={(value, index) => ({
            fill: labelColor,
            textAnchor: "start",
            fontSize: 10,
            fontFamily: "Arial",
            dx: "0.25em",
            dy: "0.25em",
          })}
        />
        <AxisBottom
          top={height - margin.bottom}
          left={0}
          scale={xScale}
          numTicks={numTicksForWidth(width)}
          label={axisBottomLabel}
        >
          {(axis) => {
            const tickLabelSize = 8;
            const tickRotate = 45;
            const tickColor = labelColor;
            const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;
            return (
              <g className="my-custom-bottom-axis">
                {axis.ticks.map((tick, i) => {
                  const tickX = tick.to.x;
                  const tickY =
                    tick.to.y + tickLabelSize + (axis.tickLength ?? 0);
                  return (
                    <Group
                      // eslint-disable-next-line @typescript-eslint/no-base-to-string
                      key={`vx-tick-${String(tick.value)}-${i}`}
                      className={"vx-axis-tick"}
                    >
                      <Line from={tick.from} to={tick.to} stroke={tickColor} />
                      <text
                        transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                        fontSize={tickLabelSize}
                        textAnchor="middle"
                        fill={tickColor}
                        fontFamily={"Arial"}
                      >
                        {tick.formattedValue}
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
      </Group>
    </svg>
  );
};
