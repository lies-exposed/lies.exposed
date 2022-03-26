// import chroma from "chroma-js";
// import { sankeyCircular } from "d3-sankey-circular";
import { alpha } from "@material-ui/core";
import {
  sankey,
  sankeyLeft,
  // sankeyJustify,
  // sankeyLeft,
  sankeyLinkHorizontal,
} from "d3-sankey";
import * as React from "react";
import { EventIcon, EventTypeColor } from "../Icons";

export const nodeWidth = 45;
export const nodePadding = 10;

const SankeyNode: React.FC<any> = ({
  color,
  x,
  y,
  x0,
  x1,
  y0,
  y1,
  height,
  outerColor,
  innerColor,
  payload,
  id,
  type,
  ...props
}) => {
  const width = x1 - x0;

  // console.log({ x, y, x0, x1, y0, y1, height, ...props });
  if (type === undefined) {
    // console.log("draw avatar");
    // console.log({ x, y, x0, x1, y0, y1, height, ...props });
    // return <circle cy={y1 - 5} cx={x1 - 5} r={10} fill={`#${color}`} />;
    const imageId = `relation-${id}`;
    const imageD = width - nodePadding / 2;
    return (
      <g key={id} x={x0} y={y0} width={width} height={width}>
        <svg x={x0} y={y0} width={imageD} height={imageD}>
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
  const rectHeight = y1 - y0
  return (
    <g key={id} x={x0} y={y0}>
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
        strokeWidth: link.width,
      }}
    />
  );
};
interface SankeyGraphProps {
  width: number;
  height: number;
  graph: {
    nodes: any[];
    links: any[];
  };
}

const SankeyGraph: React.FC<SankeyGraphProps> = ({
  width,
  height,
  ...props
}) => {
  const graph = React.useMemo((): {
    nodes: any[];
    links: any[];
  } => {
    // console.log("graph", props.graph);

    const { nodes, links } = sankey()
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

    return { nodes, links };
  }, [props.graph.nodes.length, props.graph.links.length, width, height]);

  // console.log(props.graph.nodes[0]);
  // console.log(props.graph.links[0]);
  return (
    <svg width={width} height={height}>
      <g style={{ mixBlendMode: "multiply" }} width={width} height={height}>
        {graph.links.map((link, i) => (
          <SankeyLink key={`${link.source.id}-${link.target.id}`} link={link} />
        ))}
        {graph.nodes.map((node, i) => (
          <SankeyNode key={node.id} {...node} />
        ))}
      </g>
    </svg>
  );
};

export default SankeyGraph;
