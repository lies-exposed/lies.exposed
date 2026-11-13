import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import { GROUPS } from "@liexp/io/lib/http/Group.js";
import { KEYWORDS } from "@liexp/io/lib/http/Keyword.js";
import { type NetworkLink } from "@liexp/io/lib/http/Network/Network.js";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as d3 from "d3";
import debounce from "lodash/debounce.js";
import * as React from "react";
import { eventIconsSvgDefs } from "./Network/svg/event-icons.js";

/**
 * Shape of the payload carried by a network node (actor, group, keyword or event).
 * Only the fields read by the graph are declared.
 */
interface NetworkNodeData {
  type: string;
  id: string | number;
  color?: string;
  innerColor?: string;
  tag?: string;
  image?: string;
  avatar?: { thumbnail?: string };
}

interface SimulationNode extends d3.SimulationNodeDatum {
  data: NetworkNodeData;
  index: number;
  id: string;
}

const isOneOf = (values: readonly string[], value: string): boolean =>
  values.includes(value);

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  index: number;
  value?: number;
  fill?: string;
  sourceType?: string;
  stroke?: string;
  color?: string;
}

const toLinkInput = (l: SimulationLink) => ({
  source: typeof l.source === "object" ? String(l.source.id) : l.source,
  target: typeof l.target === "object" ? String(l.target.id) : l.target,
  value: l.value,
  fill: l.fill,
  sourceType: l.sourceType,
  stroke: l.stroke,
});

export interface ForcedNetworkGraphProps {
  id: string;
  nodes: { data: unknown; index?: number; id?: string | number }[];
  // given d in nodes, returns a unique identifier (string)
  nodeId: (n: {
    data: unknown;
    index?: number;
    id?: string | number;
  }) => string;
  links: NetworkLink[];
  // given d in links, returns a node identifier string
  linkSource?: (l: {
    source: string | number;
    target: string | number;
    value?: number;
    fill?: string;
    sourceType?: string;
    stroke?: string;
  }) => string;
  // given d in links, returns a node identifier string
  linkTarget?: (l: {
    source: string | number;
    target: string | number;
    value?: number;
    fill?: string;
    sourceType?: string;
    stroke?: string;
  }) => string;
  // given d in nodes, returns an (ordinal) value for color
  nodeGroup: (d: {
    data: unknown;
    index?: number;
    id?: string | number;
  }) => number;
  // an array of ordinal values representing the node groups
  nodeGroups: string[];
  // given d in nodes, a title string
  nodeTitle?: (d: {
    data: unknown;
    index?: number;
    id?: string | number;
  }) => string;
  // node stroke fill (if not using a group color encoding)
  nodeFill?: string;
  // node stroke color
  nodeStroke?: string;
  nodeStrokeWidth?: number; // node stroke width, in pixels
  nodeStrokeOpacity?: number; // node stroke opacity
  nodeRadius?: (n: {
    data: unknown;
    index?: number;
    id?: string | number;
  }) => number; // node radius, in pixels
  nodeStrength?: number | ((n: SimulationNode) => number);
  // link stroke color
  linkStroke?:
    | string
    | ((l: {
        source: string | number;
        target: string | number;
        value?: number;
        fill?: string;
        sourceType?: string;
        stroke?: string;
      }) => string);
  // link stroke opacity
  linkStrokeOpacity?:
    | number
    | ((l: {
        source: string | number;
        target: string | number;
        value?: number;
        fill?: string;
        sourceType?: string;
        stroke?: string;
      }) => number);
  // given d in links, returns a stroke width in pixels
  linkStrokeWidth?:
    | number
    | ((l: {
        source: string | number;
        target: string | number;
        value?: number;
        fill?: string;
        sourceType?: string;
        stroke?: string;
      }) => number);
  // link stroke linecap
  linkStrokeLinecap?: string;
  linkStrength?:
    | number
    | ((l: {
        source: string | number;
        target: string | number;
        value?: number;
        fill?: string;
        sourceType?: string;
        stroke?: string;
      }) => number);
  // an array of color strings, for the node groups
  colors?: string[];
  // outer width, in pixels
  width?: number;
  // outer height, in pixels
  height?: number;
  // when this promise resolves, stop the simulation
  invalidation?: (() => Promise<unknown>) | null;
  onClick?: (n: {
    data: unknown;
    index?: number;
    id?: string | number;
  }) => void;
}

export const ForcedNetworkGraph: React.FC<ForcedNetworkGraphProps> = ({
  id,
  nodes: _nodes,
  nodeId,
  links: _links,
  linkSource = ({ source }) => String(source),
  linkTarget = ({ target }) => String(target),
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
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current!).html(null);

    const g = svg.append("g").attr("width", width).attr("height", height);

    // Compute values.
    const N = d3.map(_nodes, nodeId).map(intern);
    const LS = d3.map(_links, linkSource).map(intern);
    const LT = d3.map(_links, linkTarget).map(intern);

    const T = nodeTitle == null ? null : d3.map(_nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(_nodes, nodeGroup).map(intern);
    const W =
      typeof linkStrokeWidth !== "function"
        ? []
        : d3.map(_links, linkStrokeWidth);
    const L =
      typeof linkStroke !== "function" ? [] : d3.map(_links, linkStroke);

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G).map(String);

    // Construct the scales.
    const color =
      nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Replace the input nodes and links with mutable objects for the simulation.
    const nodes: SimulationNode[] = d3.map(
      _nodes,
      ({ data: _, index: idx }, i) => ({
        index: idx ?? i,
        id: String(N[i]),
        data: _ as NetworkNodeData,
      }),
    );

    const links: SimulationLink[] = d3.map(_links, (_, i) => ({
      index: i,
      source: LS[i],
      target: LT[i],
      value: _.value,
      color: L[i],
      fill: _.fill,
      sourceType: _.sourceType,
      stroke: _.stroke,
    }));

    // Construct the forces.
    const forceNode = d3.forceManyBody<SimulationNode>();

    const forceLink = d3
      .forceLink<SimulationNode, SimulationLink>(links)
      .id(({ index: i }) => N[i ?? 0]);

    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined)
      forceLink.strength(
        typeof linkStrength === "function"
          ? (l) => linkStrength(toLinkInput(l))
          : linkStrength,
      );

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    let transform: d3.ZoomTransform;
    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
      g.attr("transform", (transform = e.transform));
      // g.style("stroke-width", 3 / Math.sqrt(transform.k));
      node.attr("r", (n) => nodeRadius(n) / Math.sqrt(transform.k));
      // .attr("stroke-width", nodeStrokeWidth / Math.sqrt(transform.k));

      link.attr(
        "stroke-width",
        (typeof linkStrokeWidth !== "function" ? linkStrokeWidth : 3) /
          Math.sqrt(transform.k),
      );

      text?.style(
        "font-size",
        (k) => `${(nodeRadius(k) * 2) / Math.sqrt(transform.k)}px`,
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

      eventIconDefs.onTransform(transform);

      keywordPattern
        .attr("height", (k) => (nodeRadius(k) * 2) / Math.sqrt(transform.k))
        .style(
          "font-size",
          (k) => `${(nodeRadius(k) * 2) / Math.sqrt(transform.k)}px`,
        );
    });

    const simulation = d3
      .forceSimulation<SimulationNode>()
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("center", d3.forceCenter())
      .on("tick", ticked);

    // event icons svg
    const eventIconDefs = eventIconsSvgDefs(g, 10);

    let text:
      | d3.Selection<SVGTextElement, SimulationNode, SVGGElement, unknown>
      | undefined;
    if (T) {
      text = g
        .append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll<SVGTextElement, SimulationNode>("text")
        .data(
          nodes.filter((n) =>
            EventType.members
              .flatMap((t) => t.literals[0])
              .some((t) => t === n.data.type),
          ),
        )
        .join("text")
        .attr("class", "title")
        .attr("data-id", (d) => d.data.id)
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
      .selectAll("line")
      .data(links)
      .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
      .attr(
        "stroke-opacity",
        typeof linkStrokeOpacity === "function"
          ? (l) => linkStrokeOpacity(toLinkInput(l))
          : linkStrokeOpacity,
      )
      .attr("stroke-linecap", linkStrokeLinecap)
      .enter()
      .append("line")
      .attr("class", "link");

    const wrapperNode = g.append("g").attr("fill", nodeFill);
    const nodeG = wrapperNode.selectAll("g").data(nodes).join("g");

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

    const actorOrGroupNode = nodeG.filter((n) =>
      isOneOf([ACTORS.literals[0], GROUPS.literals[0]], n.data.type),
    );

    actorOrGroupNode
      .attr("stroke", (d) => `#${d.data.color}`)
      .attr("stroke-opacity", nodeStrokeOpacity);

    const actorOrGroupPattern = actorOrGroupNode
      .append("pattern")
      .attr("id", (n) => `${n.data.type}-${n.data.id}`)
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
      .attr("xlink:href", (d) => d.data.avatar?.thumbnail ?? null);

    const eventNodeNode = nodeG.filter(
      (n) =>
        !isOneOf(
          [ACTORS.literals[0], GROUPS.literals[0], KEYWORDS.literals[0]],
          n.data.type,
        ),
    );

    // eventNodeNode
    //   .attr("stroke", (d) => `#${d.color}`)
    //   .attr("stroke-opacity", nodeStrokeOpacity);

    const eventNodePattern = eventNodeNode
      .append("pattern")
      .attr("id", (n) => `event-${n.data.id}`)
      .attr("width", 28)
      .attr("height", 28)
      .attr("x", 0)
      .attr("y", 0);

    eventNodePattern
      .append("rect")
      .attr("height", 28)
      .attr("width", 28)
      .attr("fill", "#fff");

    const eventNodeImage = eventNodePattern
      .filter((n) => Boolean(n.data.image))
      .append("svg:image")
      .attr("id", (d) => `event-image-${d.data.id}`)
      .attr("xlink:href", (d) => d.data.image ?? null);

    const node = nodeG
      .append("circle")
      .attr("class", "node")
      .attr("r", nodeRadius)
      .attr("fill", "#fff")
      .attr("fill", (d) => {
        if (
          isOneOf(
            [ACTORS.literals[0], GROUPS.literals[0], KEYWORDS.literals[0]],
            d.data.type,
          )
        ) {
          return `url(#${d.data.type}-${d.data.id})`;
        }

        if (d.data.image) {
          return `url(#event-image-${d.data.id})`;
        }

        if (
          isOneOf(
            EventType.members.flatMap((t) => t.literals[0]),
            d.data.type,
          )
        ) {
          return `url(#event-${d.data.type.toLowerCase()})`;
        }

        if (d.data.innerColor) {
          return toColorHash(d.data.innerColor);
        }

        if (color) {
          return color(d.data.type);
        }
        return "white";
      })
      .attr("data-id", (d) => d.data.id)
      .style("cursor", "pointer")
      .call(drag(simulation));

    const keywordPattern = nodeG
      .filter((n) => KEYWORDS.literals[0] === n.data.type)
      .append("text")
      .text(`#`)
      .attr("fill", (d) => `#${d.data.color}`)
      .attr("stroke", (d) => `#${d.data.color}`)
      .style("cursor", "pointer")
      .on(
        "mouseenter",
        debounce(
          function (this: SVGTextElement, _, d) {
            const n = d3.select(this);
            n.raise();
            return n.text(`#${d.data.tag}`);
          },
          300,
          { leading: true },
        ),
      )
      .on(
        "mouseout",
        debounce(
          function (this: SVGTextElement, _, _d) {
            const n = d3.select(this);
            n.raise();
            return n.text(`#`);
          },
          300,
          { leading: true },
        ),
      );

    node
      .filter((n) =>
        isOneOf(
          EventType.members.map((t) => t.literals[0]),
          n.data.type,
        ),
      )
      .on("mouseenter", function (this: SVGCircleElement) {
        const n = d3.select(this);
        const dataId = n.attr("data-id");
        n.raise();
        const text = d3.select(`.title[data-id="${dataId}"]`);
        return text.style("display", "block");
      })
      .on("mouseout", function (this: SVGCircleElement) {
        const dataId = d3.select(this).attr("data-id");
        const text = d3.select(`.title[data-id='${dataId}']`);
        return text.style("display", "none");
      });

    if (onClick) {
      node.on("click", (_, d) => {
        onClick(d);
      });
    }

    if (W) link.attr("stroke-width", ({ index: i }) => (i ? W[i] : null));
    if (L) link.attr("stroke", ({ index: i }) => (i ? L[i] : null));
    // if (G) node.attr("fill", ({ index: i }) => color?.(G[i]) ?? null);

    node.exit().remove();

    svg.call(zoom as d3.ZoomBehavior<SVGSVGElement, unknown>).call(
      // d3's zoom.transform.bind returns a function with incompatible signature

      zoom.transform.bind(zoom) as unknown as (
        selection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        transform: d3.ZoomTransform,
      ) => void,
      d3.zoomIdentity,
    );

    if (invalidation !== null) {
      void invalidation().then(() => simulation.stop());
    }

    function intern<T>(value: T): T {
      return value !== null && typeof value === "object"
        ? (value.valueOf() as T)
        : value;
    }

    function ticked(): void {
      link
        .attr("x1", (d) => (d.source as SimulationNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimulationNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimulationNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimulationNode).y ?? 0);

      node.attr("cx", (d) => d.x ?? 10).attr("cy", (d) => d.y ?? 10);
      text
        ?.attr("dx", (d) => (d.x ?? 0) + nodeRadius(d) * 2)
        .attr("dy", (d) => (d.y ?? 0) - nodeRadius(d) * 2);

      // actorOrGroupImage.attr("x", 0).attr("y", 0);

      // eventIconSvg
      //   .attr("x", (d) => nodeRadius(d) / 3)
      //   .attr("y", (d) => nodeRadius(d) / 3);

      keywordPattern
        .attr("dx", function (this, d) {
          return d.x ?? 10 - 9;
        })
        .attr("dy", function (this, d) {
          return d.y ?? 10 + this.getComputedTextLength() / 2;
        });
    }

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
        d.fx = undefined;
        d.fy = undefined;
      }

      return d3
        .drag<SVGCircleElement, SimulationNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    return () => {};
  }, [width, height, _nodes, _links]);

  return <svg id={id} ref={svgRef} width={width} height={height} />;
};
