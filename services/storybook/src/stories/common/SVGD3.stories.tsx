/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventIconsSvgDefs } from "@liexp/ui/lib/components/Common/Graph/Network/svg/event-icons.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as d3 from "d3";
import * as React from "react";

const meta: Meta = {
  title: "Components/SVGD3",
};

export default meta;

function intern(value: any) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

type SimulationNode = d3.SimulationNodeDatum & {
  id: number;
};

const SVGD3Template: StoryFn<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current).html(null);

    const g = svg.append("g").attr("width", width).attr("height", height);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const nodes: SimulationNode[] = [
      { index: 1, id: 1 },
      { index: 2, id: 2 },
    ];
    const nodeId = (d: SimulationNode) => d.id;
    const N = d3.map(nodes, nodeId).map(intern);

    const links: d3.SimulationLinkDatum<SimulationNode>[] = [
      {
        source: 1,
        target: 2,
      },
    ];

    const forceNode = d3.forceManyBody<SimulationNode>();
    const forceLink = d3
      .forceLink<SimulationNode, d3.SimulationLinkDatum<SimulationNode>>(links)
      .id(({ index: i }) => {
        return N[i ?? 0];
      });

    // event icons svg
    eventIconsSvgDefs(g, 20);

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("center", d3.forceCenter());

    g.append("circle")
      .attr("r", 20)
      .attr("fill", "red")
      .attr("fill", "url(#event-quote)")

      .call(drag(simulation));

    // svg
    //   .call(zoom as any)
    //   .call(zoom?.transform?.bind(zoom) as any, d3.zoomIdentity);

    function drag(this: any, simulation: any): any {
      function dragstarted(event: any, d: any): void {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragged(event: any, d: any): void {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any): void {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    return () => {};
  }, [width, height]);

  return <svg id={"event-icons"} ref={svgRef} width={width} height={height} />;
};

export const SVGD3 = {
  render: SVGD3Template,

  args: {
    width: 600,
    height: 600,
  },
};
