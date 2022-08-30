import * as React from "react";
import { useStatsQuery } from "../../state/queries/DiscreteQueries";
import { HierarchicalEdgeBundling } from "../Common/Graph/HierarchicalEdgeBundling";
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
        graph: useStatsQuery({
          id: props.keyword,
          type: "keywords",
        }),
      }}
      render={({ graph }) => {
        return <HierarchicalEdgeBundling graph={graph} width={props.width} />;
      }}
    />
  );
};
