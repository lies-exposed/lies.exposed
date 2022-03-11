// import chroma from "chroma-js";
// import { sankeyCircular } from "d3-sankey-circular";
import {
  sankey,
  sankeyCenter,
  // sankeyJustify,
  // sankeyLeft,
  sankeyLinkHorizontal,
} from "d3-sankey";
import * as React from "react";
import { EventTypeColor } from "../Icons";

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
  // console.log({ x, y, x0, x1, y0, y1, height, ...props });
  if (type === undefined) {
    // console.log("draw avatar");
    // console.log({ x, y, x0, x1, y0, y1, height, ...props });
    return (<circle cy={y1 - 5} cx={x1 - 5} r={10} fill={`#${color}`} />)
    // return (
    //   <image
    //     key={id}
    //     x={x0}
    //     y={y0 - 15}
    //     href={props.avatar}
    //     width={30}
    //     height={30}
    //     style={{
    //       borderRadius: 10,
    //     }}
    //   />
    // );
  }

  return (
    <rect
      key={id}
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      fill={(EventTypeColor as any)[type]}
    >
      <title>{payload.title}</title>
    </rect>
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
  // console.log(props.graph);

  const graph = React.useMemo((): {
    nodes: any[];
    links: any[];
  } => {
    // console.log("graph", props.graph);

    const { nodes, links } = sankey()
      .nodeWidth(30)
      .nodePadding(10)
      .nodeId((n: any) => n.id)
      .nodeAlign(sankeyCenter)
      .iterations(2)
      .extent([
        [0, 0],
        [width, height],
      ])(props.graph);

    // const color = chroma.scale("Set3").classes(nodes.length);

  //     const colorScale = d3.scaleLinear().domain([0, nodes.length]).range([0, 1]);

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
