import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import * as React from "react";
import { useStatsQuery } from "../../state/queries/stats.queries.js";
import {
  HierarchicalEdgeBundling,
  type HierarchicalEdgeBundlingOnClickProps,
} from "../Common/Graph/HierarchicalEdgeBundling.js";
import QueriesRenderer from "../QueriesRenderer.js";

export interface ActorHierarchyEdgeBundlingGraphProps
  extends HierarchicalEdgeBundlingOnClickProps {
  actor: string;
  width: number;
}

export const ActorHierarchyEdgeBundlingGraph: React.FC<
  ActorHierarchyEdgeBundlingGraphProps
> = ({ actor, ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        graph: useStatsQuery({
          id: actor,
          type: StatsType.types[1].value,
        }),
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
