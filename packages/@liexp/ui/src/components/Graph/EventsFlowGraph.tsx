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
import * as React from "react";
import {
  FlowGraph,
  type FlowGraphProps,
} from "../Common/Graph/Flow/FlowGraph.js";
import { edgeTypes } from "../Common/Graph/Flow/links/index.js";
import { nodeTypes } from "../Common/Graph/Flow/nodes/index.js";

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

const NODE_LINE_CHUNK = 10;

export const EventsFlowGraph: React.FC<EventFlowGraphProps> = ({
  graph,
  filters,
  ...props
}) => {
  const { nodes, edges } = React.useMemo(() => {
    const keywordNodes = graph.keywords.map((data, i) => ({
      id: data.id,
      position: nodePosition(i, NODE_LINE_CHUNK, {
        x: -600,
        y: 0,
      }),
      data,
      selected: filters.keywords.includes(data.id),
      type: Keyword.Keyword.name,
    }));

    const actorNodes = graph.actors.map((data, i) => ({
      id: data.id,
      data: data,
      selected: filters.actors.includes(data.id),
      type: Actor.Actor.name,
      position: nodePosition(i, NODE_LINE_CHUNK, {
        x: -100,
        y: 0,
      }),
    }));

    const groupNodes = graph.groups.map((data, i) => ({
      id: data.id,
      data,
      selected: filters.groups.includes(data.id),
      type: Group.Group.name,
      position: nodePosition(i, NODE_LINE_CHUNK, {
        x:
          (graph.actors.length / NODE_LINE_CHUNK > 1
            ? NODE_LINE_CHUNK
            : graph.actors.length) *
            40 +
          50,
        y: 0,
      }),
    }));

    const eventNodes = pipe(
      graph.events,
      fp.A.reverse,
      fp.A.mapWithIndex((i, data) => ({
        id: data.id,
        data,
        selected: fp.Ord.between(fp.Date.Ord)(filters.minDate, filters.maxDate)(
          parseISO(data.date),
        ),
        type: Events.Event.name,
        position: {
          y: 200 + i * 50,
          x:
            data.type === Events.EventTypes.UNCATEGORIZED.value
              ? -50
              : data.type === Events.EventTypes.SCIENTIFIC_STUDY.value
                ? -25
                : data.type === Events.EventTypes.PATENT.value
                  ? 0
                  : data.type === Events.EventTypes.DEATH.value
                    ? 25
                    : data.type === Events.EventTypes.DOCUMENTARY.value
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

    const nodeIds = nodes.filter((n) => n.selected).map((n) => n.id);

    const actorEdges = graph.actorLinks.map(({ fill, ...l }) => ({
      ...l,
      id: l.source,
      data: {
        color: toColor(fill),
      },
      selected: !!(
        nodeIds.find((id) => l.source === id) &&
        nodeIds.find((id) => l.target === id)
      ),
      type: Actor.Actor.name,
    }));

    const groupEdges = graph.groupLinks.map(({ fill, ...l }) => ({
      ...l,
      id: l.source,
      data: { color: toColor(fill) },
      selected: !!(
        nodeIds.find((id) => l.source === id) &&
        nodeIds.find((id) => l.target === id)
      ),
      type: Group.Group.name,
    }));

    const keywordEdges = graph.keywordLinks.map(({ fill, ...l }) => ({
      ...l,
      id: l.source,
      data: {
        color: toColor(fill),
      },
      selected: !!(
        nodeIds.find((id) => l.source === id) &&
        nodeIds.find((id) => l.target === id)
      ),
      type: Keyword.Keyword.name,
    }));

    const eventEdges = graph.eventLinks.map(({ fill, ...l }) => ({
      ...l,
      id: l.source,
      data: {
        color: toColor(fill),
      },
      selected: !!(
        nodeIds.find((id) => l.source === id) &&
        nodeIds.find((id) => l.target === id)
      ),
      type: Events.Event.name,
    }));

    const edges = [
      ...actorEdges,
      ...groupEdges,
      ...keywordEdges,
      ...eventEdges,
    ];

    return { nodes, edges };
  }, [graph, filters]);

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
