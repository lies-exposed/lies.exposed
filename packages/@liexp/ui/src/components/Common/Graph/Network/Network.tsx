import { type NetworkNodeDatum } from "@liexp/io/lib/http/Network/Network.js";
import { AxisBottom } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { Graph } from "@visx/network";
import { type Graph as GraphType } from "@visx/network/lib/types.js";
import { scaleTime } from "@visx/scale";
import { Tooltip } from "@visx/tooltip";
import withTooltip, {
  type WithTooltipProvidedProps,
} from "@visx/tooltip/lib/enhancers/withTooltip.js";
import * as A from "fp-ts/lib/Array.js";
import * as React from "react";
import NetworkLink, { type NetworkLinkProps } from "./NetworkLink.js";
import { NetworkNode } from "./NetworkNode.js";

const backgroundColor = "transparent";

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2;
  if (width > 300 && width <= 400) return 5;
  return 10;
}

export type NetworkScale = "all" | "year" | "month" | "week" | "day";

export interface NetworkPointDatum extends NetworkNodeDatum {
  x: number;
  y: number;
}

export type NetworkGraphType<L, N extends NetworkPointDatum> = GraphType<L, N>;

export interface NetworkBaseProps<
  L extends NetworkLinkProps<N>,
  N extends NetworkPointDatum,
> {
  width: number;
  height: number;
  scale: NetworkScale;
  minDate: Date;
  maxDate: Date;
  graph: NetworkGraphType<L, N>;
  tooltipRenderer: (tooltipData: N) => React.ReactElement;
  onEventLabelClick: (event: string) => void;
  onNodeClick: (event: N) => void;
  onDoubleClick: (event: N, scale: NetworkScale) => void;
}

export type NetworkProps<
  L extends NetworkLinkProps<N>,
  N extends NetworkPointDatum,
> = NetworkBaseProps<L, N> & WithTooltipProvidedProps<N>;

const Network = <L extends NetworkLinkProps<N>, N extends NetworkPointDatum>(
  props: NetworkProps<L, N>,
): React.ReactElement => {
  const handleMouseOver = (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    datum: N,
  ): void => {
    const svgElement = (event.target as SVGElement).ownerSVGElement;
    if (svgElement === null) return;
    const coords = localPoint(svgElement, event.nativeEvent);
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
  });

  return (
    <React.Fragment>
      <svg width={width} height={height} style={{ cursor: "grab" }}>
        <Group>
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
                const [head, last] = A.splitAt(1)(graph.nodes);
                const first = head[0];
                if (first === undefined) return;
                const nearestPoint = last.reduce<N>(
                  (acc, n) =>
                    Math.abs(acc.x - point.x) < Math.abs(n.x - point.x)
                      ? acc
                      : n,
                  first,
                );

                props.onDoubleClick(nearestPoint, props.scale);
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
            tickLabelProps={(_value, _index) => ({
              fill: "#fff",
              textAnchor: "end",
              fontSize: 10,
              fontFamily: "Arial",
            })}
            tickComponent={({ formattedValue, values, ...tickProps }) => (
              <text {...tickProps}>
                {formattedValue} {values}
              </text>
            )}
          />

          <Graph
            graph={graph}
            linkComponent={(props) => NetworkLink(props.link)}
            nodeComponent={(props) =>
              NetworkNode({
                node: props.node,
                onMouseOver: handleMouseOver,
                onMouseOut: hideTooltip,
                onClick: onNodeClick,
              })
            }
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData !== undefined ? (
        <Tooltip
          key={Math.random()}
          top={tooltipTop ?? 0}
          left={tooltipLeft}
          style={{
            maxWidth: 300,
            minWidth: 300,
            position: "absolute",
            backgroundColor: "white",
            zIndex: 100,
            marginTop: -150,
          }}
        >
          {props.tooltipRenderer(tooltipData)}
        </Tooltip>
      ) : null}
    </React.Fragment>
  );
};

export default <L extends NetworkLinkProps<N>, N extends NetworkPointDatum>(
  props: NetworkBaseProps<L, N>,
):
  | Promise<React.ReactNode>
  | React.ReactElement<NetworkBaseProps<L, N>>
  | React.ReactNode
  | null => withTooltip<NetworkBaseProps<L, N>, N>(Network)(props);
