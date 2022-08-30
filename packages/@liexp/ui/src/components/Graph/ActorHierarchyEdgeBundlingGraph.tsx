import * as React from "react";
import { searchEventsQuery } from "../../state/queries/SearchEventsQuery";
import { HierarchicalEdgeBundling } from "../Common/Graph/HierarchicalEdgeBundling";
import { createHierarchicalEdgeBundling } from "../Common/Graph/createHierarchicalEdgeBundlingData";
import QueriesRenderer from "../QueriesRenderer";

export interface ActorHierarchyEdgeBundlingGraphProps {
  actor: string;
  width: number;
}

export const ActorHierarchyEdgeBundlingGraph: React.FC<
  ActorHierarchyEdgeBundlingGraphProps
> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: `actor-edge-bundling-${props.actor}`,
          actors: [props.actor],
          _start: 0,
          _end: 100,
          _sort: "createdAt",
          _order: "DESC",
        }),
      }}
      render={({ events }) => {
        const graph = createHierarchicalEdgeBundling({
          events: events.events,
          groups: events.groups,
          actors: events.actors,
          hideEmptyRelations: true,
          relation: "actor",
        });

        return <HierarchicalEdgeBundling {...graph} width={props.width} />;
      }}
    />
  );
};
