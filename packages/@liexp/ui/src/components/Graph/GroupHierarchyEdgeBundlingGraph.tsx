import { StatsType } from "@liexp/shared/lib/io/http/Stats";
import * as React from "react";
import {
  HierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingOnClickProps,
} from "../Common/Graph/HierarchicalEdgeBundling";
import QueriesRenderer from "../QueriesRenderer";

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
            type: StatsType.types[2].value,
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
