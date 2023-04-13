import { StatsType } from "@liexp/shared/lib/io/http/Stats";
import * as React from "react";
import { useHierarchyNetworkGraphQuery } from "../../state/queries/network.queries";
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
      queries={{
        graph: useHierarchyNetworkGraphQuery(
          {
            id: group as any,
            type: StatsType.types[2].value,
          },
          {}
        ),
      }}
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
