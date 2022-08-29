import * as React from "react";
import { searchEventsQuery } from "../../state/queries/SearchEventsQuery";
import { HierarchicalEdgeBundling } from "../Common/Graph/HierarchicalEdgeBundling";
import { createHierarchicalEdgeBundling } from "../Common/Graph/createHierarchicalEdgeBundlingData";
import QueriesRenderer from "../QueriesRenderer";

export interface KeywordHierarchyEdgeBundlingGraphProps {
  keyword: string;
  width: number;
}

export const KeywordHierarchyEdgeBundlingGraph: React.FC<
  KeywordHierarchyEdgeBundlingGraphProps
> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: `keyword-edge-bundling-${props.keyword}`,
          keywords: [props.keyword],
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
          relation: 'keyword'
        });

        return <HierarchicalEdgeBundling {...graph} width={props.width} />;
      }}
    />
  );
};
