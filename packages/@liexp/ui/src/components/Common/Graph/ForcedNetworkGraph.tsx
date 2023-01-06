import * as d3 from "d3";
import * as React from "react";

export interface ForcedNetworkGraphProps {
  id: string;
  nodes: any[];
  // given d in nodes, returns a unique identifier (string)
  nodeId: (n: any) => string;
  links: any[];
  // given d in links, returns a node identifier string
  linkSource?: (l: any) => string;
  // given d in links, returns a node identifier string
  linkTarget?: (l: any) => string;
  // given d in nodes, returns an (ordinal) value for color
  nodeGroup: (d: any) => number;
  // an array of ordinal values representing the node groups
  nodeGroups: any[];
  // given d in nodes, a title string
  nodeTitle?: (d: any) => string;
  // node stroke fill (if not using a group color encoding)
  nodeFill?: string;
  // node stroke color
  nodeStroke?: string;
  nodeStrokeWidth?: number; // node stroke width, in pixels
  nodeStrokeOpacity?: number; // node stroke opacity
  nodeRadius?: (n: any) => number; // node radius, in pixels
  nodeStrength?: number | ((n: any) => number);
  // link stroke color
  linkStroke?: string | ((s: any) => string);
  // link stroke opacity
  linkStrokeOpacity?: number | ((s: any) => number);
  // given d in links, returns a stroke width in pixels
  linkStrokeWidth?: number | ((s: any) => number);
  // link stroke linecap
  linkStrokeLinecap?: string;
  linkStrength?: number | ((n: any) => number);
  // an array of color strings, for the node groups
  colors?: string[];
  // outer width, in pixels
  width?: number;
  // outer height, in pixels
  height?: number;
  // when this promise resolves, stop the simulation
  invalidation?: () => Promise<any>;
  onClick?: (n: any) => void;
}

export const ForcedNetworkGraph: React.FC<ForcedNetworkGraphProps> = ({
  id,
  nodes,
  nodeId,
  links,
  linkSource = ({ source }) => source,
  linkTarget = ({ target }) => target,
  nodeTitle,
  nodeGroup,
  nodeGroups,
  nodeStrength,
  nodeFill = "currentColor",
  nodeStroke = "#fff",
  nodeStrokeWidth = 1.5,
  nodeStrokeOpacity = 1,
  nodeRadius = () => 5,
  linkStroke = "#999",
  linkStrokeOpacity = 0.6,
  linkStrokeWidth = 1.5,
  linkStrokeLinecap = "round",
  linkStrength,
  colors = d3.schemeTableau10,
  width = 640,
  height = 400,
  invalidation = null,
  onClick,
}) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current).html(null);

    const g = svg.append("g").attr("width", width).attr("height", height);

    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W =
      typeof linkStrokeWidth !== "function"
        ? []
        : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? [] : d3.map(links, linkStroke);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({
      id: N[i],
      type: _.type,
      payload: _.payload,
    }));
    links = d3.map(links, (_, i) => ({
      source: LS[i],
      target: LT[i],
      value: _.value,
    }));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color =
      nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();

    const forceLink = d3.forceLink(links).id(({ index: i }) => {
      return N[i ?? 0];
    });

    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    let transform: any;
    const zoom = d3.zoom().on("zoom", (e) => {
      g.attr("transform", (transform = e.transform));
      // g.style("stroke-width", 3 / Math.sqrt(transform.k));
      node
        .attr("r", (n) => nodeRadius(n) / Math.sqrt(transform.k))
        .attr("stroke-width", nodeStrokeWidth / Math.sqrt(transform.k));

      link.attr(
        "stroke-width",
        (typeof linkStrokeWidth !== "function" ? linkStrokeWidth : 3) /
          Math.sqrt(transform.k)
      );

      text.style("font-size", 12 / Math.sqrt(transform.k));
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("center", d3.forceCenter())
      .on("tick", ticked);

    let text: any;
    if (T) {
      text = g
        .append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("class", "title")
        .attr("data-id", (d) => d.id)
        .style("text-anchor", "bottom")
        .style("font-size", "12px")
        .style("stroke", "#000")
        .style("display", "none")
        .text(({ index: i }) => T[i]);
    }

    const link = g
      .append("g")
      .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
      .attr("stroke-opacity", linkStrokeOpacity)
      .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link");

    const node = g
      .append("g")
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-opacity", nodeStrokeOpacity)
      .attr("stroke-width", nodeStrokeWidth)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .attr("data-id", (d) => d.id)
      .style("cursor", "pointer")
      .call(drag(simulation))
      .on("mouseover", function (this: any) {
        const n = d3.select(this);
        const dataId = n.attr("data-id");
        n.raise();
        const text = d3.select(`.title[data-id="${dataId}"]`);
        return text.style("display", "block");
      })
      .on("mouseout", function (this: any) {
        const dataId = d3.select(this).attr("data-id");
        const text = d3.select(`.title[data-id='${dataId}']`);
        return text.style("display", "none");
      });

    if (onClick) {
      node.on("click", function (this: any) {
        onClick(d3.select(this).datum());
      });
    }

    if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
    if (L) link.attr("stroke", ({ index: i }) => L[i]);
    if (G) node.attr("fill", ({ index: i }) => color?.(G[i]) ?? null);

    node.exit().remove();

    svg.call(zoom as any).call(zoom.transform as any, d3.zoomIdentity);

    if (invalidation !== null) {
      void invalidation().then(() => simulation.stop());
    }

    function intern(value: any): any {
      return value !== null && typeof value === "object"
        ? value.valueOf()
        : value;
    }

    function ticked(): void {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      text
        .attr("dx", (d: any) => d.x + nodeRadius(d) * 2)
        .attr("dy", (d: any) => d.y - nodeRadius(d) * 2);
    }

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
  }, [width, height, nodes, links]);

  return <svg id={id} ref={svgRef} width={width} height={height} />;
};
