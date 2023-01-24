import * as React from "react";
import { useStatsQuery } from "../../state/queries/DiscreteQueries";
import {
  HierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingOnClickProps,
} from "../Common/Graph/HierarchicalEdgeBundling";
import QueriesRenderer from "../QueriesRenderer";

export interface KeywordHierarchyEdgeBundlingGraphProps
  extends HierarchicalEdgeBundlingOnClickProps {
  keyword: string;
  width: number;
}

export const KeywordHierarchyEdgeBundlingGraph: React.FC<
  KeywordHierarchyEdgeBundlingGraphProps
> = ({ keyword, ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        graph: useStatsQuery({
          id: keyword,
          type: "keywords",
        }),
      }}
      render={({ graph }) => {
        return <HierarchicalEdgeBundling {...props} graph={graph} />;
      }}
    />
  );
};
