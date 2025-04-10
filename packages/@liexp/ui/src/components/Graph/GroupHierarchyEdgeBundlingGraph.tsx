import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import * as React from "react";
import {
  HierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingOnClickProps,
} from "../Common/Graph/HierarchicalEdgeBundling.js";
import QueriesRenderer from "../QueriesRenderer.js";

export interface GroupHierarchyEdgeBundlingGraphProps
  extends HierarchicalEdgeBundlingOnClickProps {
  group: string;
  width: number;
}

export const GroupHierarchyEdgeBundlingGraph: React.FC<
  GroupHierarchyEdgeBundlingGraphProps
> = ({ group, ...props }) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        graph: Q.Networks.Custom.GetHierarchyNetwork.useQuery(
          {
            type: StatsType.members[2].literals[0],
          },
          {
            filter: {
              ids: [group],
            },
          },
        ),
      })}
      render={({ graph }) => {
        return (
          <HierarchicalEdgeBundling
            {...props}
            graph={{ nodes: [], links: [] }}
            hideLabels={true}
          />
        );
      }}
    />
  );
};
