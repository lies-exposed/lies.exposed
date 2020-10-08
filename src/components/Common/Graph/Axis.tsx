import { AxisLeft, AxisRight, AxisBottom } from "@vx/axis"
import { curveBasis } from "@vx/curve"
import { Grid } from "@vx/grid"
import { Group } from "@vx/group"
import { scaleLinear } from "@vx/scale"
import { Bar, LinePath, Line } from "@vx/shape"
import { extent } from "d3-array"
import React from "react"

// accessors

// responsive utils for axis ticks
function numTicksForHeight(height: number): number {
  if (height <= 300) return 3
  if (height > 300 && height <= 600) return 5
  return 10
}

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2
  if (width > 300 && width <= 400) return 5
  return 10
}
interface AxisProps<D> {
  id: string
  background: (id: string) => JSX.Element 
  linePathElement: (id: string) => JSX.Element
  width: number
  height: number
  data: D[]
  minX?: number
  minY?: number
  getX: (e: D) => number
  axisLeftLabel: string
  axisRightLabel: string
  axisBottomLabel: string
  getY: (e: D) => number
  margin: {
    top: number
    left: number
    bottom: number
    right: number
  }
}

export const Axis = <D extends any>({
  id,
  data,
  width,
  height,
  margin,
  background,
  linePathElement,
  minX = 0,
  minY = 0,
  getX,
  getY,
  axisLeftLabel,
  axisRightLabel,
  axisBottomLabel,
}: AxisProps<D>): JSX.Element => {
  // bounds
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  // scales
  const xScale = scaleLinear({
    range: [0, xMax],
    domain: extent(data, getX) as any,
  })

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [minY, Math.max(...data.map(getY))],
    nice: true,
  })

  const linePathId = `line-path-${id}`
  const backgroundId = `background-${id}`;

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
        strokeWidth={8}
        rx={7}
      />

      <Grid
        top={margin.top}
        left={margin.left}
        xScale={xScale}
        yScale={yScale}
        stroke="rgba(142, 32, 95, 0.9)"
        width={xMax}
        height={yMax}
        numTicksRows={numTicksForHeight(height)}
        numTicksColumns={numTicksForWidth(width)}
      />
      <Group top={margin.top} left={margin.left}>
        <LinePath
          data={data}
          x={(d) => xScale(getX(d))}
          y={(d) => yScale(getY(d))}
          stroke={`url('#${linePathId}')`}
          strokeWidth={3}
          curve={curveBasis}
        />
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
            fill: "#8e205f",
            textAnchor: "middle",
            fontSize: 12,
            fontFamily: "Arial",
          }}
          stroke="#1b1a1e"
          tickStroke="#8e205f"
          tickLabelProps={(value, index) => ({
            fill: "#8e205f",
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
          left={xMax}
          scale={yScale}
          hideZero
          numTicks={numTicksForHeight(height)}
          label={axisRightLabel}
          labelProps={{
            fill: "#8e205f",
            textAnchor: "middle",
            fontSize: 12,
            fontFamily: "Arial",
          }}
          stroke="#1b1a1e"
          tickStroke="#8e205f"
          tickLabelProps={(value, index) => ({
            fill: "#8e205f",
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
            const tickLabelSize = 10
            const tickRotate = 45
            const tickColor = "#8e205f"
            const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2
            return (
              <g className="my-custom-bottom-axis">
                {axis.ticks.map((tick, i) => {
                  const tickX = tick.to.x
                  const tickY = tick.to.y + tickLabelSize + axis.tickLength
                  return (
                    <Group
                      key={`vx-tick-${String(tick.value)}-${i}`}
                      className={"vx-axis-tick"}
                    >
                      <Line from={tick.from} to={tick.to} stroke={tickColor} />
                      <text
                        transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                        fontSize={tickLabelSize}
                        textAnchor="middle"
                        fill={tickColor}
                      >
                        {tick.value}
                      </text>
                    </Group>
                  )
                })}
                <text
                  textAnchor="middle"
                  transform={`translate(${axisCenter}, 50)`}
                  fontSize="8"
                >
                  {axis.label}
                </text>
              </g>
            )
          }}
        </AxisBottom>
      </Group>
    </svg>
  )
}
