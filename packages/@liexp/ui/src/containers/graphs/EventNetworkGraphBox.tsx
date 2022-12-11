import { GetNetworkQuery, NetworkType } from "@liexp/shared/io/http/Network";
import { ParentSize } from "@visx/responsive";
import { UUID } from "io-ts-types/UUID";
import * as React from "react";
import { runtimeType } from "ts-io-error/lib/Codec";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "../../components/Graph/EventsNetworkGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import { useNetworkGraphQuery } from "../../state/queries/DiscreteQueries";

export interface EventNetworkGraphBoxProps
  extends Omit<
    EventsNetworkGraphProps,
    "events" | "actors" | "groups" | "keywords" | "graph" | "width" | "height"
  > {
  count?: number;
  type: NetworkType;
  id: UUID;
  query: Partial<runtimeType<typeof GetNetworkQuery>>;
}

export const EventNetworkGraphBox: React.FC<EventNetworkGraphBoxProps> = ({
  count = 50,
  query,
  id,
  type,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={{
        graph: useNetworkGraphQuery({ id, type }, query),
      }}
      render={({ graph }) => {
        return (
          <ParentSize
            debounceTime={1000}
            style={{ height: "100%", width: "100%" }}
          >
            {({ width, height }) => {
              return (
                <EventsNetworkGraph
                  {...props}
                  events={[]}
                  actors={[]}
                  groups={[]}
                  keywords={[]}
                  graph={graph}
                  width={width}
                  height={height}
                  scale="all"
                />
              );
            }}
          </ParentSize>
        );
      }}
    />
  );
};
