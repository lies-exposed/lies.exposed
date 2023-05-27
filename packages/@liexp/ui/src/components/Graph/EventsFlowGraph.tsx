import { fp } from "@liexp/core/lib/fp";
import { Actor, Events, Group, Keyword } from "@liexp/shared/lib/io/http";
import { type FlowGraphOutput } from "@liexp/shared/lib/io/http/Graph";
import { toColor } from "@liexp/shared/lib/utils/colors";
import { parseISO } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  BaseEdge,
  Handle,
  Position,
  getBezierPath,
  type EdgeProps,
  type NodeProps,
} from "reactflow";
import EventCard from "../Cards/Events/EventCard";
import { FlowGraph, type FlowGraphProps } from "../Common/Graph/FlowGraph";
import { EventIcon } from "../Common/Icons";
import { ActorListItem } from "../lists/ActorList";
import { GroupListItem } from "../lists/GroupList";
import { KeywordListItem } from "../lists/KeywordList";

const EventNode: React.FC<NodeProps<Events.SearchEvent.SearchEvent>> = ({
  data,
  targetPosition,
  sourcePosition,
  selected,
}) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200, zIndex: selected ? 1000 : 0 }}>
        {targetPosition ? (
          <Handle type="target" position={Position.Left} />
        ) : null}
        {!selected ? (
          <EventIcon type={data.type} />
        ) : (
          <EventCard
            event={data}
            showMedia={true}
            showRelations={false}
            onEventClick={() => {}}
          />
        )}
        {sourcePosition ? (
          <Handle type="source" position={Position.Right} />
        ) : null}
      </div>
    </React.Suspense>
  );
};

const ActorNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ maxWidth: 200 }}>
      <ActorListItem item={data} displayFullName={false} />
      <Handle type="source" position={Position.Right} />
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
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: data.color }}
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
    </>
  );
};

const GroupNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200 }}>
        <Handle type="source" position={Position.Right} />
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
        <Handle
          type="source"
          position={yPos < 0 ? Position.Bottom : Position.Top}
        />
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

export const EventsFlowGraph: React.FC<EventFlowGraphProps> = ({
  graph,
  filters,
  ...props
}) => {
  const { nodes, edges } = React.useMemo(() => {
    const actorNodes = graph.actors
      .filter((a) => filters.actors.includes(a.id))
      .map((a, i) => ({
        id: a.id,
        data: { ...a, selected: true },
        type: Actor.Actor.name,
        position: {
          x: -100,
          y: (i % 2 === 0 ? -i : i) * 40,
        },
      }));

    const groupNodes = graph.groups
      .filter((g) => filters.groups.includes(g.id))
      .map((a, i) => ({
        id: a.id,
        data: { ...a, selected: true },
        type: Group.Group.name,
        position: {
          x: -200,
          y: (i % 2 === 0 ? -i : i) * 20,
        },
      }));

    const eventNodes = graph.events
      .filter((e) =>
        fp.Ord.between(fp.Ord.ordDate)(filters.minDate, filters.maxDate)(
          parseISO(e.date)
        )
      )
      .map((e, i) => ({
        id: e.id,
        data: e,
        type: Events.Event.name,
        position: {
          x: 100 + i * 50,
          y:
            e.type === Events.Uncategorized.UNCATEGORIZED.value
              ? 10
              : e.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value
              ? 20
              : e.type === Events.Patent.PATENT.value
              ? 30
              : e.type === Events.Death.DEATH.value
              ? 40
              : e.type === Events.Documentary.DOCUMENTARY.value
              ? 50
              : 60,
        },
      }));

    const keywordNodes = graph.keywords
      .filter((k) => filters.keywords.includes(k.id))
      .map((k, i) => ({
        id: k.id,
        position: {
          x: pipe(
            eventNodes.findIndex(
              (e) => !!e.data.keywords.find((kk: string) => k.id === kk)
            ),
            (ii) => 50 + (ii < 1 ? 0 : ii * 50)
          ),
          y: (i % 2 === 0 ? i : -i) * 20,
        },
        data: { ...k, selected: true },
        type: Keyword.Keyword.name,
      }));

    const nodes = [
      ...eventNodes,
      ...actorNodes,
      ...groupNodes,
      ...keywordNodes,
    ];

    const actorEdges = graph.actorLinks
      .filter((l) =>
        filters.actors.some((id) => l.source === id || l.target === id)
      )
      .map(({ color, ...l }) => ({
        ...l,
        data: { color: toColor(color) },
        type: Actor.Actor.name,
      }));

    const groupEdges = graph.groupLinks
      .filter((l) =>
        filters.groups.some((id) => l.source === id || l.target === id)
      )
      .map(({ color, ...l }) => ({
        ...l,
        data: { color: toColor(color) },
      }));

    const keywordEdges = graph.keywordLinks
      .filter((l) =>
        filters.keywords.some((id) => l.source === id || l.target === id)
      )
      .map(({ color, ...l }) => ({
        ...l,
        data: { color: toColor(color) },
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
    []
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
