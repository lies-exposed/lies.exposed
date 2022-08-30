import { StatsType } from "@liexp/shared/io/http/Stats";
import * as React from "react";
import { useStatsQuery } from "../../state/queries/DiscreteQueries";
import { HierarchicalEdgeBundling } from "../Common/Graph/HierarchicalEdgeBundling";
import QueriesRenderer from "../QueriesRenderer";

export interface ActorHierarchyEdgeBundlingGraphProps {
  actor: string;
  width: number;
}

export const ActorHierarchyEdgeBundlingGraph: React.FC<
  ActorHierarchyEdgeBundlingGraphProps
> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        graph: useStatsQuery({
          id: props.actor,
          type: StatsType.types[1].value,
        }),
      }}
      render={({ graph }) => {
        return <HierarchicalEdgeBundling graph={graph} width={props.width} hideLabels={true} />;
      }}
    />
  );
};
