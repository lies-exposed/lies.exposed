// import chroma from "chroma-js";
import {
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

const SankeyNode: React.FC<any> = ({
  _color,
  _x,
  _y,
  x0,
  x1,
  y0,
  y1,
  _height,
  _outerColor,
  _innerColor,
  payload,
  id,
  type,
  onClick,
  ...props
}) => {
  const width = x1 - x0;
  const rectHeight = y1 - y0;

  // console.log({ x, y, x0, x1, y0, y1, height, ...props });
  if (type === undefined) {
    // console.log("draw avatar");
    // console.log({ x, y, x0, x1, y0, y1, height, ...props });
    // return <circle cy={y1 - 5} cx={x1 - 5} r={10} fill={`#${color}`} />;
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
          onClick({
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
                xlinkHref={props.avatar}
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
          <title>{props.fullName ?? props.name ?? props.tag}</title>
        </svg>
      </g>
    );
  }

  const iconD = width - nodePadding;

  return (
    <g
      key={id}
      x={x0}
      y={y0}
      onClick={() => onClick({ ...props, payload, id })}
    >
      <rect
        x={x0}
        y={y0}
        width={width}
        height={rectHeight}
        fill={alpha((EventTypeColor as any)[type], 0.2)}
      />
      <EventIcon
        type={type}
        width={iconD}
        height={iconD}
        x={x0 + nodePadding / 2}
        y={y0 + rectHeight / 2 - iconD / 2}
      />
      <title>{payload.title}</title>
    </g>
  );
};

const SankeyLink: React.FC<{ link: any }> = ({ link }) => {
  // console.log("link", link);

  const d = sankeyLinkHorizontal()(link);

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
interface SankeyGraphProps {
  width: number;
  height: number;
  graph: {
    links: any[];
    nodes: any[];
  };
  onEventClick: (e: any) => void;
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
    nodes: any[];
    links: any[];
  } => {
    // console.log("graph", props.graph);

    const graph = sankey()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeId((n: any) => n.id)
      .nodeAlign(sankeyLeft)
      .extent([
        [0, 0],
        [width, height],
      ])(props.graph);

    // const color = chroma.scale("Set3").classes(nodes.length);

    // const colorScale = d3.scaleLinear().domain([0, nodes.length]).range([0, 1]);

    return graph;
  }, [props.graph.nodes.length, props.graph.links.length, width, height]);

  // const graph = React.useMemo(() => {
  //   return sankey().update(_graph);
  // }, [_graph.nodes.length, _graph.links.length, width, height]);

  // console.log(props.graph.nodes[0]);
  // console.log(props.graph.links[0]);
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
