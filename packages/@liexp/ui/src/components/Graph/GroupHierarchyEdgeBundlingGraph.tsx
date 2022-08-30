import { StatsType } from "@liexp/shared/io/http/Stats";
import * as React from "react";
import { useStatsQuery } from "../../state/queries/DiscreteQueries";
import { HierarchicalEdgeBundling } from "../Common/Graph/HierarchicalEdgeBundling";
import QueriesRenderer from "../QueriesRenderer";

export interface GroupHierarchyEdgeBundlingGraphProps {
  group: string;
  width: number;
}

export const GroupHierarchyEdgeBundlingGraph: React.FC<
  GroupHierarchyEdgeBundlingGraphProps
> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        graph: useStatsQuery({
          id: props.group,
          type: StatsType.types[2].value,
        }),
      }}
      render={({ graph }) => {
        return <HierarchicalEdgeBundling graph={graph} width={props.width} hideLabels={true} />;
      }}
    />
  );
};
