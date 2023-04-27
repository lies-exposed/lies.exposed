import * as React from "react";
import { useHierarchyNetworkGraphQuery } from "../../state/queries/network.queries";
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
        graph: useHierarchyNetworkGraphQuery(
          {
            type: "keywords",
          },
          {
            ids: [keyword],
          }
        ),
      }}
      render={({ graph }) => {
        return (
          <HierarchicalEdgeBundling
            {...props}
            graph={{ nodes: [], links: graph.keywordLinks }}
          />
        );
      }}
    />
  );
};
