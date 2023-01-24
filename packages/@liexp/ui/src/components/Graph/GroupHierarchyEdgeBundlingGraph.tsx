import { StatsType } from "@liexp/shared/io/http/Stats";
import * as React from "react";
import { useStatsQuery } from "../../state/queries/DiscreteQueries";
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
        graph: useStatsQuery({
          id: group,
          type: StatsType.types[2].value,
        }),
      }}
      render={({ graph }) => {
        return (
          <HierarchicalEdgeBundling
            {...props}
            graph={graph}
            hideLabels={true}
          />
        );
      }}
    />
  );
};
