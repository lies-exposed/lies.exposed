import { AxisBottom } from "@vx/axis";
import { localPoint } from "@vx/event";
import { Group } from "@vx/group";
import { Graph } from "@vx/network";
import { Graph as GraphType } from "@vx/network/lib/types";
import { scaleTime } from "@vx/scale";
import { Tooltip } from "@vx/tooltip";
import withTooltip, {
  WithTooltipProvidedProps,
} from "@vx/tooltip/lib/enhancers/withTooltip";
import * as A from "fp-ts/lib/Array";
import * as React from "react";
import NetworkLink, { NetworkLinkProps } from "./NetworkLink";
import { NetworkNode, NetworkNodeDatum, NetworkPointNode } from "./NetworkNode";

const backgroundColor = "#123ed4";

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2;
  if (width > 300 && width <= 400) return 5;
  return 10;
}

export type NetworkScale = "all" | "year" | "month" | "week" | "day";

export type NetworkGraphType<L, N extends NetworkNodeDatum> = GraphType<
  L,
  NetworkPointNode<N>
>;

export interface NetworkBaseProps<
  L extends NetworkLinkProps<N>,
  N extends NetworkNodeDatum
> {
  width: number;
  height: number;
  scale: NetworkScale;
  minDate: Date;
  maxDate: Date;
  graph: NetworkGraphType<L, N>;
  tooltipRenderer: (tooltipData: N) => JSX.Element;
  onEventLabelClick: (event: string) => void;
  onNodeClick: (event: NetworkPointNode<N>) => void;
  onDoubleClick: (event: NetworkPointNode<N>, scale: NetworkScale) => void;
}

export type NetworkProps<
  L extends NetworkLinkProps<N>,
  N extends NetworkNodeDatum
> = NetworkBaseProps<L, N> & WithTooltipProvidedProps<N>;

const Network = <L extends NetworkLinkProps<N>, N extends NetworkNodeDatum>(
  props: NetworkProps<L, N>
): JSX.Element => {
  const handleMouseOver = (event: any, datum: any): void => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    if (coords !== null) {
      if (
        props.showTooltip !== undefined &&
        props.tooltipLeft !== coords.x &&
        props.tooltipTop !== coords.y
      ) {
        props.showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum,
        });
      }
    }
  };

  const {
    width,
    height,
    graph,
    minDate,
    maxDate,
    onNodeClick,
    hideTooltip,
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
  } = props;

  const bottomScale = scaleTime({
    range: [0, width],
    domain: [minDate, maxDate],
    nice: true,
  });

  return (
    <React.Fragment>
      <Group>
        <svg width={width} height={height} style={{ cursor: "grab" }}>
          {/* <RectClipPath id="zoom-clip" width={300} height={200} /> */}
          <rect
            width={width}
            height={height}
            rx={7}
            fill={backgroundColor}
            stroke={backgroundColor}
            strokeWidth="3"
          />
          <rect
            width={width}
            height={height}
            rx={7}
            fill="transparent"
            onDoubleClick={(event) => {
              const point = localPoint(event);
              if (point !== null) {
                const [first, last] = A.splitAt(1)(graph.nodes);
                const nearestPoint = last.reduce((acc, n) => {
                  if (Math.abs(acc.x - point.x) < Math.abs(n.x - point.x)) {
                    return acc;
                  }
                  return n;
                }, first[0]);

                if (nearestPoint !== undefined) {
                  props.onDoubleClick(nearestPoint, props.scale);
                }
              }
            }}
          />
          <AxisBottom
            left={0}
            top={height - 30}
            scale={bottomScale}
            hideZero
            numTicks={numTicksForWidth(width)}
            label="Date"
            labelProps={{
              fill: "#fff",
              textAnchor: "middle",
              fontSize: 12,
              fontFamily: "Arial",
            }}
            stroke="#ff0"
            tickStroke="#ff0"
            tickLabelProps={(value, index) => ({
              fill: "#fff",
              textAnchor: "end",
              fontSize: 10,
              fontFamily: "Arial",
            })}
            tickComponent={({ formattedValue, ...tickProps }) => (
              <text {...tickProps}>{formattedValue}</text>
            )}
          />

          <Graph
            graph={graph}
            linkComponent={(props) => NetworkLink(props.link)}
            nodeComponent={(props) =>
              NetworkNode({
                ...props,
                onMouseOver: handleMouseOver,
                onMouseOut: hideTooltip,
                onClick: onNodeClick,
              })
            }
          />
        </svg>
      </Group>
      {tooltipOpen && tooltipData !== undefined ? (
        <Tooltip
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            maxWidth: 300,
            minWidth: 300,
            position: "absolute",
            backgroundColor: "white",
            zIndex: 100,
          }}
        >
          {props.tooltipRenderer(tooltipData)}
        </Tooltip>
      ) : null}
    </React.Fragment>
  );
};

export default <L extends NetworkLinkProps<N>, N extends NetworkNodeDatum>(
  props: NetworkBaseProps<L, N>
): React.ReactElement<NetworkBaseProps<L, N>> | null =>
  withTooltip<NetworkBaseProps<L, N>, N>(Network)(props);
