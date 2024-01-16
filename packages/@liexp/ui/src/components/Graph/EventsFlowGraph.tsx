import { fp } from "@liexp/core/lib/fp/index.js";
import { type FlowGraphOutput } from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import { Actor, Events, Group, Keyword } from "@liexp/shared/lib/io/http/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { parseISO } from "date-fns";
import { pipe } from "fp-ts/lib/function.js";
import React from "react";
import {
  BaseEdge,
  Handle,
  Position,
  getBezierPath,
  type EdgeProps,
  type NodeProps,
} from "reactflow";
import EventCard from "../Cards/Events/EventCard.js";
import { FlowGraph, type FlowGraphProps } from "../Common/Graph/FlowGraph.js";
import { EventIcon } from "../Common/Icons/index.js";
import { ActorListItem } from "../lists/ActorList.js";
import { GroupListItem } from "../lists/GroupList.js";
import { KeywordListItem } from "../lists/KeywordList.js";

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

const EventNode: React.FC<NodeProps<Events.SearchEvent.SearchEvent>> = ({
  data,
  targetPosition,
  sourcePosition,
  selected,
}) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 300, zIndex: selected ? 1000 : 0 }}>
        {targetPosition ? (
          <Handle type="target" position={Position.Bottom} />
        ) : null}
        {!selected ? (
          <EventIcon
            type={data.type}
            style={{
              opacity: (data as any).selected ? 1 : 0.5,
            }}
          />
        ) : (
          <EventCard event={data} showMedia={true} showRelations={false} />
        )}
        {sourcePosition ? (
          <Handle type="source" position={Position.Top} />
        ) : null}
      </div>
    </React.Suspense>
  );
};

const ActorNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ maxWidth: 200 }}>
      <ActorListItem item={data} displayFullName={false} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const ActorLink: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <div key={id}>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{ ...style }}
      />
      {/* <EdgeLabelRenderer>
         <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            backgroundColor: `${data.color}`,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={(event) => {}}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer> */}
    </div>
  );
};

const GroupNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200 }}>
        <Handle type="source" position={Position.Bottom} />
        <GroupListItem item={data} displayName={false} />
        {/* <Handle type="target" position={Position.Left} /> */}
      </div>
    </React.Suspense>
  );
};

const KeywordNode: React.FC<NodeProps> = ({ yPos, data }) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200 }}>
        <Handle type="source" position={Position.Bottom} />
        <KeywordListItem item={data} />
      </div>
    </React.Suspense>
  );
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
