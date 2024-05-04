import { fp } from "@liexp/core/lib/fp/index.js";
import { type FlowGraphOutput } from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import {
  Actor,
  Events,
  Group,
  Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { parseISO } from "date-fns";
import { pipe } from "fp-ts/lib/function.js";
import React from "react";
import { FlowGraph, type FlowGraphProps } from "../Common/Graph/Flow/FlowGraph.js";
import { ActorLink } from "../Common/Graph/Flow/links/ActorLink.js";
import { ActorNode } from "../Common/Graph/Flow/nodes/ActorNode.js";
import { EventNode } from "../Common/Graph/Flow/nodes/EventNode.js";
import { GroupNode } from "../Common/Graph/Flow/nodes/GroupNode.js";
import { KeywordNode } from "../Common/Graph/Flow/nodes/KeywordNode.js";

const nodePosition = (
  i: number,
  chunk: number,
  offset: { x: number; y: number },
): { x: number; y: number } => {
  const x = (i % chunk) * 40 + offset.x;
  const y = -(Math.floor(i / 10) * 50) + offset.y;
  return {
    x,
    y,
  };
};

interface EventFlowGraphProps extends FlowGraphProps {
  graph: FlowGraphOutput;
  filters: {
    actors: string[];
    groups: string[];
    keywords: string[];
    minDate: Date;
    maxDate: Date;
  };
}

const nodeLineChunk = 10;

export const EventsFlowGraph: React.FC<EventFlowGraphProps> = ({
  graph,
  filters,
  ...props
}) => {
  const { nodes, edges } = React.useMemo(() => {
    const keywordNodes = graph.keywords.map((k, i) => ({
      id: k.id,
      position: nodePosition(i, nodeLineChunk, {
        x: -600,
        y: 0,
      }),
      data: { ...k, selected: filters.keywords.includes(k.id) },
      type: Keyword.Keyword.name,
    }));

    const actorNodes = graph.actors.map((a, i) => ({
      id: a.id,
      data: { ...a, selected: filters.actors.includes(a.id) },
      type: Actor.Actor.name,
      position: nodePosition(i, nodeLineChunk, {
        x: -100,
        y: 0,
      }),
    }));

    const groupNodes = graph.groups.map((a, i) => ({
      id: a.id,
      data: { ...a, selected: filters.groups.includes(a.id) },
      type: Group.Group.name,
      position: nodePosition(i, nodeLineChunk, {
        x:
          (graph.actors.length / nodeLineChunk > 1
            ? nodeLineChunk
            : graph.actors.length) *
            40 +
          50,
        y: 0,
      }),
    }));

    const eventNodes = pipe(
      graph.events,
      fp.A.reverse,
      fp.A.mapWithIndex((i, e) => ({
        id: e.id,
        data: {
          ...e,
          selected: fp.Ord.between(fp.Ord.ordDate)(
            filters.minDate,
            filters.maxDate,
          )(parseISO(e.date)),
        },
        type: Events.Event.name,
        position: {
          y: 200 + i * 50,
          x:
            e.type === Events.EventTypes.UNCATEGORIZED.value
              ? -50
              : e.type === Events.EventTypes.SCIENTIFIC_STUDY.value
                ? -25
                : e.type === Events.EventTypes.PATENT.value
                  ? 0
                  : e.type === Events.EventTypes.DEATH.value
                    ? 25
                    : e.type === Events.EventTypes.DOCUMENTARY.value
                      ? 50
                      : 75,
        },
      })),
    );

    const nodes = [
      ...eventNodes,
      ...actorNodes,
      ...groupNodes,
      ...keywordNodes,
    ];

    const nodeIds = nodes.filter((n) => n.data.selected).map((n) => n.id);

    const actorEdges = graph.actorLinks
      .filter(
        (l) =>
          nodeIds.find((id) => l.source === id) &&
          nodeIds.find((id) => l.target === id),
      )
      .map(({ fill, ...l }) => ({
        ...l,
        id: l.source + l.target,
        data: { color: toColor(fill) },
        // type: Actor.Actor.name,
      }));

    const groupEdges = graph.groupLinks
      .filter(
        (l) =>
          nodeIds.find((id) => l.source === id) &&
          nodeIds.find((id) => l.target === id),
      )
      .map(({ fill, ...l }) => ({
        ...l,
        id: l.source + l.target,
        data: { color: toColor(fill) },
      }));

    const keywordEdges = graph.keywordLinks
      .filter(
        (l) =>
          nodeIds.find((id) => l.source === id) &&
          nodeIds.find((id) => l.target === id),
      )
      .map(({ fill, ...l }) => ({
        ...l,
        id: l.source + l.target,
        data: { color: toColor(fill) },
      }));

    const edges = [...actorEdges, ...groupEdges, ...keywordEdges];
    return { nodes, edges };
  }, [graph, filters]);

  const { nodeTypes, edgeTypes } = React.useMemo(
    () => ({
      nodeTypes: {
        [Events.Event.name]: EventNode,
        [Actor.Actor.name]: ActorNode,
        [Group.Group.name]: GroupNode,
        [Keyword.Keyword.name]: KeywordNode,
      },
      edgeTypes: {
        [Actor.Actor.name]: ActorLink,
      },
    }),
    [],
  );

  return (
    <FlowGraph
      {...props}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    />
  );
};
