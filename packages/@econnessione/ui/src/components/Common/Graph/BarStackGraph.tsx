import { AxisBottom, AxisLeft } from "@vx/axis";
import { AxisProps } from "@vx/axis/lib/axis/Axis";
import { Grid } from "@vx/grid";
import { Group } from "@vx/group";
import { LegendOrdinal } from "@vx/legend";
import { BarStack } from "@vx/shape";
import { SeriesPoint, StackKey } from "@vx/shape/lib/types";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@vx/tooltip";
import { ScaleBand, ScaleLinear, ScaleOrdinal } from "d3-scale";
import * as React from "react";

export interface TooltipData<D, K> {
  bar: SeriesPoint<D>;
  key: K;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
}

export interface BarStackGraphProps<D, K extends StackKey> {
  data: D[];
  keys: K[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleOrdinal<K, string>;
  getX: (d: D) => string;
  axisBottom?: AxisProps<any>;
  axisLeft?: AxisProps<any>;
  tooltipRenderer: (d: TooltipData<D, K>) => React.ReactNode;
}

export const background = "transparent";
const defaultMargin = { top: 40, right: 80, bottom: 40, left: 80 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "transparent",
  color: "white",
};

let tooltipTimeout: number;

export const BarStackGraph = <D, K extends StackKey>({
  width,
  height,
  events = false,
  data,
  keys,
  yScale,
  xScale,
  colorScale,
  margin = defaultMargin,
  getX,
  axisBottom,
  axisLeft,
  tooltipRenderer,
}: BarStackGraphProps<D, K>): JSX.Element | null => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData<D, K>>();

  if (width < 10) return null;
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  yScale.rangeRound([yMax, 0]);
  xScale.rangeRound([0, xMax]);

  return width < 10 ? null : (
    // relative position is needed for correct tooltip positioning
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={background}
          rx={14}
        />
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={xScale.bandwidth() / 2}
        />
        <Group top={margin.top} left={margin.left}>
          <BarStack<D, K>
            data={data}
            keys={keys as any}
            x={getX}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => {
                  return (
                    <rect
                      key={`bar-stack-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      height={bar.height}
                      width={bar.width}
                      fill={bar.color}
                      onClick={() => {
                        if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={(event) => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const top = event.clientY;
                        const left = bar.x + bar.width / 2;
                        showTooltip({
                          tooltipData: bar,
                          tooltipTop: top,
                          tooltipLeft: left,
                        });
                      }}
                    />
                  );
                })
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          label={axisBottom?.label}
          scale={xScale}
          {...axisBottom}
        />
        <AxisLeft
          top={margin.top}
          left={margin.left}
          scale={yScale}
          {...axisLeft}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        <LegendOrdinal
          scale={colorScale}
          shape="circle"
          direction="row"
          labelMargin="0 15px 0 0"
        />
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()} // update tooltip bounds each render
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          {tooltipRenderer(tooltipData)}
        </TooltipWithBounds>
      )}
    </div>
  );
};
