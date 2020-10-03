// https://observablehq.com/@d3/bilevel-edge-bundling?collection=@d3/d3-hierarchy

import { Graph } from "@vx/network/lib/types"
import * as d3 from "d3"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

interface Datum {
  id: string
  text?: string
  group: number
  targets: string[]
}

interface Link {
  source: string
  target: string
  value: number
}

export interface HierarchicalEdgeBundlingProps {
  width: number
  graph: Graph<Link, Datum>
}

type HierarchyLinkedNode<N> = N & {
  incoming: Array<[HierarchyLinkedNode<N>, HierarchyLinkedNode<N>]>
  outgoing: Array<[HierarchyLinkedNode<N>, HierarchyLinkedNode<N>]>
}

function bilink(
  root: HierarchyLinkedNode<d3.HierarchyNode<Datum>>
): HierarchyLinkedNode<d3.HierarchyNode<Datum>> {
  const map: Map<
    string,
    HierarchyLinkedNode<d3.HierarchyNode<Datum>>
  > = new Map(root.leaves().map((d) => [d.data.id, d]))
  for (const d of root.leaves()) {
    d.incoming = []
    d.outgoing = d.data.targets.map((i) => [
      d,
      map.get(i) as HierarchyLinkedNode<d3.HierarchyNode<Datum>>,
    ])
  }
  for (const d of root.leaves())
    for (const o of d.outgoing) {
      if (o[1] !== undefined) {
        o[1].incoming.push(o)
      }
    }

  return root
}

const line = d3
  .lineRadial<d3.HierarchyPointNode<Datum>>()
  .curve(d3.curveBundle.beta(0.85))
  .radius((d) => d.y)
  .angle((d) => d.x)

const colorin = "#00f"
const colorout = "#f00"
const colornone = "#ccc"

export function HierarchicalEdgeBundling({
  width,
  graph,
}: HierarchicalEdgeBundlingProps): JSX.Element {
  const SVG_ID = "hierararchicalEdgeBundling"

  const radius = width / 2

  const tree = d3.cluster().size([2 * Math.PI, radius - 100])

  const getData = (): {
    children: Array<{ id: string; children: Datum[] }>
  } => {
    const { nodes, links } = graph
    const groupById: Map<number, { id: string; children: Datum[] }> = new Map()
    const nodeById = new Map(nodes.map((node) => [node.id, node]))

    for (const node of nodes) {
      const group = pipe(
        O.fromNullable(groupById.get(node.group)),
        O.getOrElse(() => ({
          id: node.group.toString(),
          children: [] as Datum[],
        })),
        (g) => ({ ...g, children: [...g.children, node] })
      )
      groupById.set(node.group, group)
    }

    for (const { source: sourceId, target: targetId } of links) {
      nodeById.get(sourceId)?.targets.push(targetId)
    }

    return { children: Array.from(groupById.values()) }
  }

  React.useEffect(() => {
    const data = getData()

    const hierarchy = d3
      .hierarchy<Datum>(data as any)
      .sort(
        (a, b) =>
          d3.ascending(a.height, b.height) ?? d3.ascending(a.data.id, b.data.id)
      )

    const root = tree(bilink(hierarchy as any)) as HierarchyLinkedNode<
      d3.HierarchyPointNode<Datum>
    >

    const svg = d3
      .select(`#${SVG_ID}`)
      .attr("viewBox", [-width / 2, -width / 2, width, width] as any)

    const outed = function (
      this: SVGTextElement,
      _: React.SyntheticEvent<SVGTextElement>,
      d: HierarchyLinkedNode<d3.HierarchyPointNode<Datum>>
    ): void {
      link.style("mix-blend-mode", "multiply")
      d3.select(this).attr("font-weight", null)
      d3.selectAll(d.incoming.map((d: any) => d.path)).attr("stroke", null)
      d3.selectAll(d.incoming.map(([d]: [any, any]) => d.text))
        .attr("fill", null)
        .attr("font-weight", null)
      d3.selectAll(d.outgoing.map((d: any) => d.path)).attr("stroke", null)
      d3.selectAll(d.outgoing.map(([, d]: [any, any]) => d.text))
        .attr("fill", null)
        .attr("font-weight", null)
    }

    const hovered = function (
      this: SVGTextElement,
      _: React.SyntheticEvent<SVGTextElement>,
      d: HierarchyLinkedNode<d3.HierarchyPointNode<Datum>>
    ): void {
      link.style("mix-blend-mode", null)
      d3.select(this).attr("font-weight", "bold").attr("cursor", "pointer")
      d3.selectAll(d.incoming.map((d: any) => d.path))
        .attr("stroke", colorin)
        .raise()

      d3.selectAll(d.incoming.map(([d]: [any, any]) => d.text))
        .attr("fill", colorin)
        .attr("font-weight", "bold")

      d3.selectAll(d.outgoing.map((d: any) => d.path))
        .attr("stroke", colorout)
        .raise()

      d3.selectAll(d.outgoing.map(([, d]: [any, any]) => d.text))
        .attr("fill", colorout)
        .attr("font-weight", "bold")
    }

    svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
      .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
      .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
      .text((d) => d.data.id)
      .each(function (d: any) {
        d.text = this.textContent
      })
      .on("mouseover", hovered as any)
      .on("mouseout", outed as any)
      .call((text) =>
        text
          .append("title")
          .text(
            (d) =>
              `${d.data.id} ${d.outgoing.length} outgoing ${d.incoming.length} incoming`
          )
      )

    const link = svg
      .append("g")
      .attr("stroke", colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(root.leaves().flatMap((leaf) => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d: any) {
        d.path = this
      })
  })

  return <svg id={SVG_ID} />
}
