// import chroma from "chroma-js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import {
  type SankeyLink as D3SankeyLink,
  type SankeyNode as D3SankeyNode,
  sankey,
  sankeyLeft,
  // sankeyJustify,
  // sankeyLeft,
  sankeyLinkHorizontal,
} from "d3-sankey";
import * as React from "react";
import { alpha, Box, Typography } from "../../mui/index.js";
import { EventIcon, EventTypeColor } from "../Icons/index.js";

export const nodeWidth = 45;
export const nodePadding = 10;

export interface SankeyNodeInput {
  id: string;
  type?: string;
  payload?: Record<string, unknown>;
  avatar?: string;
  fullName?: string;
  name?: string;
  tag?: string;
}

export interface SankeyLinkInput {
  source: string;
  target: string;
  value: number;
  stroke?: string;
}

type SankeyNodeDatum = D3SankeyNode<SankeyNodeInput, SankeyLinkInput>;
type SankeyLinkDatum = D3SankeyLink<SankeyNodeInput, SankeyLinkInput>;

export type SankeyNodeData = SankeyNodeDatum & {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export type SankeyLinkData = SankeyLinkDatum & {
  source: SankeyNodeData;
  target: SankeyNodeData;
};

interface SankeyGraphInput {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
}

const SankeyNode: React.FC<
  SankeyNodeData & { onClick?: (event: unknown) => void }
> = ({ x0, x1, y0, y1, type, payload, id, onClick, ...props }) => {
  const width = x1 - x0;
  const rectHeight = y1 - y0;

  if (type === undefined) {
    const imageId = `relation-${id}`;
    const imageD = width - nodePadding / 2;
    return (
      <g
        key={id}
        x={x0}
        y={y0}
        width={width}
        height={rectHeight}
        onClick={() =>
          onClick?.({
            ...props,
            id,
            payload,
          })
        }
      >
        <svg
          x={x0}
          y={y0 + rectHeight / 2 - imageD / 2}
          width={imageD}
          height={rectHeight}
        >
          <defs>
            <pattern
              id={imageId}
              x={0}
              y={0}
              patternUnits="userSpaceOnUse"
              height={imageD}
              width={imageD}
            >
              <image
                x={0}
                y={0}
                xlinkHref={props.avatar!}
                width={imageD}
                height={imageD}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          </defs>
          <circle
            id={`circle-${imageId}`}
            cx={imageD / 2}
            cy={imageD / 2}
            r={imageD / 2}
            fill={`url(#${imageId})`}
          />
          <title>{props.fullName! ?? props.name! ?? props.tag!}</title>
        </svg>
      </g>
    );
  }

  const iconD = width - nodePadding;

  const eventTypeColor =
    type in EventTypeColor
      ? (EventTypeColor as Record<string, string>)[type]
      : undefined;

  return (
    <g
      key={id}
      x={x0}
      y={y0}
      onClick={() => onClick?.({ ...props, payload, id })}
    >
      <rect
        x={x0}
        y={y0}
        width={width}
        height={rectHeight}
        fill={eventTypeColor ? alpha(eventTypeColor, 0.2) : "transparent"}
      />
      <EventIcon
        type={type as Event["type"]}
        width={iconD}
        height={iconD}
        x={x0 + nodePadding / 2}
        y={y0 + rectHeight / 2 - iconD / 2}
      />
      <title>{(payload as { title?: string })?.title}</title>
    </g>
  );
};

const SankeyLink: React.FC<{ link: SankeyLinkData }> = ({ link }) => {
  const d = sankeyLinkHorizontal<SankeyNodeInput, SankeyLinkInput>()(link);

  return (
    <path
      d={d ?? undefined}
      style={{
        fill: "none",
        strokeOpacity: ".5",
        stroke: link.stroke,
        strokeWidth: 3,
      }}
    />
  );
};

export interface SankeyGraphProps {
  width: number;
  height: number;
  graph: SankeyGraphInput;
  onEventClick: (e: unknown) => void;
}

const SankeyGraph: React.FC<SankeyGraphProps> = ({
  width,
  height,
  onEventClick,
  ...props
}) => {
  if (props.graph.nodes.length === 0) {
    return (
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>No data to display</Typography>
      </Box>
    );
  }

  const graph = React.useMemo((): {
    nodes: SankeyNodeData[];
    links: SankeyLinkData[];
  } => {
    const result = sankey<SankeyNodeInput, SankeyLinkInput>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeId((n) => String(n.id))
      .nodeAlign(sankeyLeft)
      .extent([
        [0, 0],
        [width, height],
      ])(props.graph);

    return {
      nodes: result.nodes as SankeyNodeData[],
      links: result.links as SankeyLinkData[],
    };
  }, [props.graph, width, height]);

  return (
    <svg width={width} height={height}>
      <g style={{ mixBlendMode: "multiply" }} width={width} height={height}>
        {graph.links.map((link, _i) => (
          <SankeyLink key={`${link.source.id}-${link.target.id}`} link={link} />
        ))}
        {graph.nodes.map((node, _i) => (
          <SankeyNode key={node.id} {...node} onClick={onEventClick} />
        ))}
      </g>
    </svg>
  );
};

export default SankeyGraph;
