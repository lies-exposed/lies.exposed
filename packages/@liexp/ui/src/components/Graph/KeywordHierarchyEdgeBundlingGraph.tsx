import * as React from "react";
import {
  HierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingOnClickProps,
} from "../Common/Graph/HierarchicalEdgeBundling.js";
import QueriesRenderer from "../QueriesRenderer.js";

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
      queries={(Q) => ({
        graph: Q.Networks.Custom.GetHierarchyNetwork.useQuery(
          {
            type: "keywords",
          },
          {
            filter: {
              ids: [keyword],
            },
          },
        ),
      })}
      render={({ graph }) => {
        return (
          <HierarchicalEdgeBundling
            {...props}
            graph={{ nodes: [], links: [...graph.keywordLinks] }}
          />
        );
      }}
    />
  );
};
