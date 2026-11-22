import { eventIconsSvgDefs } from "@liexp/ui/lib/components/Common/Graph/Network/svg/event-icons.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import * as d3 from "d3";
import * as React from "react";

type SVGD3Props = {
  width: number;
  height: number;
};

type SimulationNode = d3.SimulationNodeDatum & {
  id: number;
};

const SVGD3Component: React.FC<SVGD3Props> = ({ width, height }) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    const element = svgRef.current;
    if (element === null) {
      return () => {};
    }

    const svg = d3.select(element).html(null);

    const g = svg.append("g").attr("width", width).attr("height", height);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const nodes: SimulationNode[] = [
      { index: 1, id: 1 },
      { index: 2, id: 2 },
    ];
    const nodeId = (d: SimulationNode): number => d.id;
    const N = d3.map(nodes, nodeId);

    const links: d3.SimulationLinkDatum<SimulationNode>[] = [
      {
        source: 1,
        target: 2,
      },
    ];

    const forceNode = d3.forceManyBody<SimulationNode>();
    const forceLink = d3
      .forceLink<SimulationNode, d3.SimulationLinkDatum<SimulationNode>>(links)
      .id(({ index: i }) => N[i ?? 0] ?? 0);

    // event icons svg
    eventIconsSvgDefs(g, 20);

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("center", d3.forceCenter());

    g.append<SVGCircleElement>("circle")
      .datum(nodes[0]!)
      .attr("r", 20)
      .attr("fill", "url(#event-quote)")
      .call(drag(simulation));

    function drag(
      simulation: d3.Simulation<SimulationNode, undefined>,
    ): d3.DragBehavior<
      SVGCircleElement,
      SimulationNode,
      SimulationNode | d3.SubjectPosition
    > {
      function dragstarted(
        event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>,
        d: SimulationNode,
      ): void {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragged(
        event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>,
        d: SimulationNode,
      ): void {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(
        event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>,
        d: SimulationNode,
      ): void {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag<SVGCircleElement, SimulationNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    return () => {};
  }, [width, height]);

  return <svg id={"event-icons"} ref={svgRef} width={width} height={height} />;
};

const meta = {
  title: "Components/Common/SVGD3",
  component: SVGD3Component,
} satisfies Meta<SVGD3Props>;

export default meta;

type Story = StoryObj<typeof meta>;

const SVGD3: Story = {
  args: {
    width: 600,
    height: 600,
  },
};

export { SVGD3 };
