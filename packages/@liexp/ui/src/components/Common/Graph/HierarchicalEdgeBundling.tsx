// https://observablehq.com/@d3/bilevel-edge-bundling?collection=@d3/d3-hierarchy

import {
  type HierarchicalEdgeBundlingDatum,
  type HierarchicalEdgeBundlingProps as BaseHierarchicalEdgeBundlingProps,
} from "@liexp/shared/lib/helpers/graph/createHierarchicalEdgeBundlingData.js";
import { type HierarchyPointNode } from "@visx/hierarchy/lib/types.js";
import * as d3 from "d3";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";

type HierarchyLinkedNode<N> = N & {
  incoming: Array<[HierarchyLinkedNode<N>, HierarchyLinkedNode<N>]>;
  outgoing: Array<[HierarchyLinkedNode<N>, HierarchyLinkedNode<N>]>;
};

function bilink(
  root: HierarchyLinkedNode<d3.HierarchyNode<HierarchicalEdgeBundlingDatum>>,
): HierarchyLinkedNode<d3.HierarchyNode<HierarchicalEdgeBundlingDatum>> {
  const map = new Map<
    string,
    HierarchyLinkedNode<d3.HierarchyNode<HierarchicalEdgeBundlingDatum>>
  >(root.leaves().map((d) => [d.data.id, d]));
  const leaves = root.leaves();
  for (const d of leaves) {
    d.incoming = [];
    d.outgoing = (d.data.targets ?? []).map((i) => [d, map.get(i) as any]);
  }
  for (const d of root.leaves())
    for (const o of d.outgoing) {
      if (o[1] !== undefined) {
        o[1].incoming.push(o);
      }
    }

  return root;
}

const line = d3
  .lineRadial<d3.HierarchyPointNode<HierarchicalEdgeBundlingDatum>>()
  .curve(d3.curveBundle.beta(0.85))
  .radius((d) => d.y)
  .angle((d) => d.x);

const colorin = "#00f";
const colorout = "#f00";
const colornone = "#ccc";

export interface HierarchicalEdgeBundlingOnClickProps {
  onNodeClick: (n: HierarchyPointNode<any>) => void;
  onLinkClick: (
    l: [
      HierarchyLinkedNode<HierarchyPointNode<any>>,
      HierarchyLinkedNode<HierarchyPointNode<any>>,
    ],
  ) => void;
}

type HierarchicalEdgeBundlingProps = BaseHierarchicalEdgeBundlingProps &
  HierarchicalEdgeBundlingOnClickProps;

export function HierarchicalEdgeBundling({
  width,
  graph,
  hideLabels = false,
  onNodeClick,
  onLinkClick,
}: HierarchicalEdgeBundlingProps): JSX.Element {
  const svgRef = React.useRef(null);

  const radius = width / 2;

  const tree = d3.cluster().size([2 * Math.PI, radius - 100]);

  const getData = (): {
    children: Array<{ id: string; children: HierarchicalEdgeBundlingDatum[] }>;
  } => {
    const { nodes, links } = graph;
    const nodeMap = new Map<
      string,
      { id: string; children: HierarchicalEdgeBundlingDatum[] }
    >();
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    for (const node of nodes) {
      const group = pipe(
        O.fromNullable(nodeMap.get(node.group)),
        O.getOrElse(() => ({
          id: node.group.toString(),
          children: [] as HierarchicalEdgeBundlingDatum[],
        })),
        (g) => ({ ...g, children: [...g.children, node], targets: [] }),
      );
      nodeMap.set(node.group, group);
    }

    for (const { source: sourceId, target: targetId } of links) {
      nodeById.get(sourceId)?.targets.push(targetId);
    }

    return { children: Array.from(nodeMap.values()) };
  };

  React.useEffect(() => {
    const data = getData();

    const hierarchy = d3
      .hierarchy<HierarchicalEdgeBundlingDatum>(data as any)
      .sort(
        (a, b) =>
          d3.ascending(a.height, b.height) ??
          d3.ascending(a.data.id, b.data.id),
      );

    const root = tree(bilink(hierarchy as any) as any) as HierarchyLinkedNode<
      d3.HierarchyPointNode<HierarchicalEdgeBundlingDatum>
    >;

    const svg = d3
      .select(svgRef.current)
      .html(null)
      .attr("viewBox", [-width / 2, -width / 2, width, width] as any);

    const hovered = function (
      this: SVGElement,
      _: any,
      d: HierarchyLinkedNode<
        d3.HierarchyPointNode<HierarchicalEdgeBundlingDatum>
      >,
    ): void {
      link.style("mix-blend-mode", null);

      const incoming = d.incoming ?? [];
      const outgoing = d.outgoing ?? [];

      const incomingPaths = incoming.map((d: any) => d.path);
      const incomingTexts = incoming.map(([d]: any) => d.text);

      const outgoingPaths = outgoing.map((d: any) => d.path);
      const outgoingText = outgoing.map(([, d]: any) => d.text);

      d3.select(this).attr("font-weight", "bold");
      d3.select(this).attr("cursor", "pointer");
      d3.selectAll(incomingPaths).attr("stroke", colorin).raise();

      d3.selectAll(incomingTexts)
        .attr("fill", colorin)
        .attr("font-weight", "bold");

      d3.selectAll(outgoingPaths).attr("stroke", colorout).raise();

      d3.selectAll(outgoingText)
        .attr("fill", colorout)
        .attr("font-weight", "bold");
    };

    const outed = function (
      this: SVGElement,
      _: any,
      d: HierarchyLinkedNode<
        d3.HierarchyPointNode<HierarchicalEdgeBundlingDatum>
      >,
    ): void {
      link.style("mix-blend-mode", "multiply");

      const incoming = d.incoming ?? [];
      const outgoing = d.outgoing ?? [];
      d3.select(this).attr("font-weight", null);
      d3.selectAll(incoming.map((d: any) => d.path)).attr("stroke", null);
      d3.selectAll(incoming.map(([d]: [any, any]) => d.text))
        .attr("fill", null)
        .attr("font-weight", null);
      d3.selectAll(outgoing.map((d: any) => d.path)).attr("stroke", null);
      d3.selectAll(outgoing.map(([, d]: [any, any]) => d.text))
        .attr("fill", null)
        .attr("font-weight", null);
    };

    if (!hideLabels) {
      // labels
      svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr(
          "transform",
          (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`,
        )
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.x < Math.PI ? 40 : -40))
        .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
        .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
        .text((d) => d.data.label)
        .each(function (d: any) {
          d.text = this;
        })
        .on("mouseover", hovered)
        .on("mouseout", outed)
        .on("click", (_, d) => {
          onNodeClick(d);
        })
        .call((text) =>
          text
            .append("title")
            .text(
              (d) =>
                `${d.data.id} ${d.outgoing.length} outgoing ${d.incoming.length} incoming`,
            ),
        );
    }

    // avatars
    svg
      .append("g")
      .selectAll("circle")
      .data(root.leaves())
      .join("clipPath")
      .attr("id", (d) => d.data.id)
      .append("circle")
      .attr("r", 25)
      .attr("cx", 25)
      .attr("cy", 25);

    const avatars = svg
      .append("g")
      .selectAll("image")
      .data(root.leaves())
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`,
      )
      .append("image")
      .attr("xlink:href", (d) => d.data.avatar ?? "")
      .attr("clip-path", (d) => `url(#${d.data.id})`)
      .attr("transform", (d) => `rotate(${360 - (d.x * 180) / Math.PI - 270})`)
      .attr("width", 50)
      .attr("height", 50);

    if (hideLabels) {
      avatars
        .on("mouseover", hovered)
        .on("mouseout", outed)
        .on("click", (_, d) => {
          onNodeClick(d);
        });
    }

    const link = svg
      .append("g")
      .attr("stroke", colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(root.leaves().flatMap((leaf) => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .style("cursor", "pointer")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d: any) {
        d.path = this;
      })
      .on("click", (_, d) => {
        onLinkClick(d);
      });
  }, [graph.nodes.length]);

  return <svg ref={svgRef} />;
}

export type { HierarchicalEdgeBundlingProps };
