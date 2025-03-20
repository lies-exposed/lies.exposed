import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import * as React from "react";
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
      queries={(Q) => ({
        graph: Q.Stats.list.useQuery({
          filter: {
            id: actor,
            type: StatsType.members[1].Type,
          },
        }),
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
