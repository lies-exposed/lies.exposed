import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import * as d3 from "d3";
import { debounce } from "lodash";
import * as React from "react";
import { EventTypeColor, EventTypeIconClass } from "../Icons";

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

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color =
      nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({
      id: N[i],
      type: _.type,
      payload: _.payload,
      avatar: _.avatar,
      color: _.color,
      tag: _.tag,
      image: _.image,
      count: _.count,
    }));

    links = d3.map(links, (_, i) => ({
      source: LS[i],
      target: LT[i],
      value: _.value,
      color: L[i],
    }));

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
      node.attr("r", (n) => nodeRadius(n) / Math.sqrt(transform.k));
      // .attr("stroke-width", nodeStrokeWidth / Math.sqrt(transform.k));

      link.attr(
        "stroke-width",
        (typeof linkStrokeWidth !== "function" ? linkStrokeWidth : 3) /
          Math.sqrt(transform.k),
      );

      text.style(
        "font-size",
        (k: any) => `${(nodeRadius(k) * 2) / Math.sqrt(transform.k)}px`,
      );

      actorOrGroupImage
        .attr("width", (n) => (nodeRadius(n) * 2) / Math.sqrt(transform.k))
        .attr("height", (n) => (nodeRadius(n) * 2) / Math.sqrt(transform.k));

      actorOrGroupNode.attr(
        "stroke-width",
        nodeStrokeWidth / Math.sqrt(transform.k),
      );

      eventNodeImage
        .attr("width", (n) => (nodeRadius(n) * 2) / Math.sqrt(transform.k))
        .attr("height", (n) => (nodeRadius(n) * 2) / Math.sqrt(transform.k));

      eventIconSvg
        .attr("width", (n) => nodeRadius(n) * 2)
        .attr("height", (n) => nodeRadius(n) * 2)
        .style("font-size", "12px");

      eventIconRect
        .attr("height", (d) => (nodeRadius(d) * 2) / Math.sqrt(transform.k))
        .attr("width", (d) => (nodeRadius(d) * 2) / Math.sqrt(transform.k));

      keywordPattern
        .attr("height", (k) => (nodeRadius(k) * 2) / Math.sqrt(transform.k))
        .style(
          "font-size",
          (k) => `${(nodeRadius(k) * 2) / Math.sqrt(transform.k)}px`,
        );
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
        .data(
          nodes.filter((n) =>
            EventType.types.flatMap((t) => t.value).includes(n.type),
          ),
        )
        .join("text")
        .attr("class", "title")
        .attr("data-id", (d) => d.id)
        .style("text-anchor", "bottom")
        .style("font-size", "12px")
        .style("stroke", "#000")
        .style("display", "none");
      // .text(({ index: i, type }) =>
      //   type === KEYWORDS.value ? `#${T[i]}` : T[i],
      // );
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

    const nodeG = g
      .append("g")
      .attr("fill", nodeFill)
      .selectAll("g")
      .data(nodes)
      .join("g");

    // actors and groups avatars

    // patternNode
    //   .append("clipPath")
    //   .append("circle")
    //   .attr("cx", (d) => d.x)
    //   .attr("cy", (d) => d.y)
    //   .attr("r", nodeRadius)
    //   .attr("fill", (d) => `url(#${d.type}-${d.id})`)
    //   .style("width", (d) => nodeRadius(d) * 2 + "px")
    //   .style("height", (d) => nodeRadius(d) * 2 + "px");

    // event icons svg
    const eventIconPattern = g
      .append("svg:defs")
      .selectAll("pattern")
      .data(Object.entries(EventTypeIconClass))
      .join("svg:pattern")
      .attr("id", (n) => `event-${n[0].toLowerCase()}`)
      .attr("width", "1")
      .attr("height", "1")
      .attr("x", 0)
      .attr("y", 0)
      .append("g");

    const eventIconRect = eventIconPattern
      .append("rect")
      .attr("fill", "#fff")
      .attr("x", 0)
      .attr("y", 0);

    const eventIconSvg = eventIconPattern
      .append("svg:i")
      .attr("class", (d) => `fa fa-${d[1]}`)
      .style("color", (d) => (EventTypeColor as any)[d[0]]);

    const actorOrGroupNode = nodeG.filter((n) =>
      [ACTORS.value, GROUPS.value].includes(n.type),
    );

    actorOrGroupNode
      .attr("stroke", (d) => `#${d.color}`)
      .attr("stroke-opacity", nodeStrokeOpacity);

    const actorOrGroupPattern = actorOrGroupNode
      .append("pattern")
      .attr("id", (n: any) => `${n.type}-${n.id}`)
      .attr("width", "1.2")
      .attr("height", "1.2")
      .attr("x", 0)
      .attr("y", 0);

    actorOrGroupPattern
      .append("rect")
      .attr("height", 28)
      .attr("width", 28)
      .attr("fill", "#fff");

    const actorOrGroupImage = actorOrGroupPattern
      .append("svg:image")
      .attr("xlink:href", (d) => d.avatar);

    const eventNodeNode = nodeG.filter(
      (n) => ![ACTORS.value, GROUPS.value, KEYWORDS.value].includes(n.type),
    );

    // eventNodeNode
    //   .attr("stroke", (d) => `#${d.color}`)
    //   .attr("stroke-opacity", nodeStrokeOpacity);

    const eventNodePattern = eventNodeNode
      .append("pattern")
      .attr("id", (n: any) => `event-${n.id}`)
      .attr("width", "1.2")
      .attr("height", "1.2")
      .attr("x", 0)
      .attr("y", 0);

    eventNodePattern
      .append("rect")
      .attr("height", 28)
      .attr("width", 28)
      .attr("fill", "#fff");

    const eventNodeImage = eventNodePattern
      .append("svg:image")
      .attr("xlink:href", (d) => d.image);

    const node = nodeG
      .append("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .attr("fill", "#fff")
      .attr("fill", (d: any) => {
        if ([ACTORS.value, GROUPS.value, KEYWORDS.value].includes(d.type)) {
          return `url(#${d.type}-${d.id})`;
        }

        if (d.image) {
          return `url(#event-${d.id})`;
        }

        if (EventType.types.flatMap((t) => t.value).includes(d.type)) {
          return `url(#event-${d.type.toLowerCase()})`;
        }

        if (d.color) {
          return `#${d.color}`;
        }

        if (color) {
          return color(d.type);
        }
        return "white";
      })
      .attr("data-id", (d: any) => d.id)
      .style("cursor", "pointer")
      .call(drag(simulation));

    const keywordPattern = nodeG
      .filter((n) => KEYWORDS.value === n.type)
      .append("text")
      .text(`#`)
      .attr("fill", (d) => `#${d.color}`)
      .attr("stroke", (d) => `#${d.color}`)
      .style("cursor", "pointer")
      .on(
        "mouseenter",
        debounce(
          function (this: any, _, d) {
            const n = d3.select(this);
            n.raise();
            return n.text(`#${d.tag}`);
          },
          300,
          { leading: true },
        ),
      )
      .on(
        "mouseout",
        debounce(
          function (this: any, _, d) {
            const n = d3.select(this);
            n.raise();
            return n.text(`#`);
          },
          300,
          { leading: true },
        ),
      );

    node
      .filter((n) => EventType.types.map((t) => t.value).includes(n.type))
      .on("mouseenter", function (this: any) {
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
    // if (G) node.attr("fill", ({ index: i }) => color?.(G[i]) ?? null);

    node.exit().remove();

    svg
      .call(zoom as any)
      .call(zoom.transform.bind(zoom) as any, d3.zoomIdentity);

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

      // actorOrGroupImage.attr("x", 0).attr("y", 0);

      eventIconSvg
        .attr("x", (d) => nodeRadius(d) / 3)
        .attr("y", (d) => nodeRadius(d) / 3);

      keywordPattern
        .attr("dx", function (this, d) {
          return d.x - 9;
        })
        .attr("dy", function (this, d) {
          return d.y + this.getComputedTextLength() / 2;
        });
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
