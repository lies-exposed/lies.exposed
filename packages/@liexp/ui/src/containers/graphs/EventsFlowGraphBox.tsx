import { Actor, Group, Keyword } from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import { type GetNetworkQuery } from "@liexp/shared/lib/io/http/Network";
import { type FlowGraphType } from "@liexp/shared/lib/io/http/graphs/FlowGraph";
import { type UUID } from "io-ts-types/lib/UUID";
import React from "react";
import { type Node } from "reactflow";
import { type serializedType } from "ts-io-error/lib/Codec";
import { EventsFlowGraph } from "../../components/Graph/EventsFlowGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import EventsAppBar from "../../components/events/filters/EventsAppBar";
import { Box } from "../../components/mui";

export interface EventsFlowGraphBoxProps {
  id: UUID;
  type: FlowGraphType;
  query: Partial<serializedType<typeof GetNetworkQuery>>;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const EventsFlowGraphBox: React.FC<EventsFlowGraphBoxProps> = ({
  query: _query,
  type,
  id,
  onEventClick,
}) => {
  const [state, setState] = React.useState<{
    startDate: string | undefined;
    endDate: string | undefined;
    ids: string[];
    type: string[] | string | undefined;
    selectedActorIds: string[];
    selectedGroupIds: string[];
    selectedKeywordIds: string[];
  }>({
    startDate: _query.startDate ?? undefined,
    endDate: _query.endDate ?? undefined,
    type,
    ids: _query.ids ?? [],
    selectedActorIds: _query.actors ?? [],
    selectedGroupIds: _query.groups ?? [],
    selectedKeywordIds: _query.keywords ?? [],
  });

  const query: any = React.useMemo(() => {
    return {
      ..._query,
      actors:
        state.selectedActorIds.length > 0 ? state.selectedActorIds : undefined,
      groups:
        state.selectedGroupIds.length > 0 ? state.selectedGroupIds : undefined,
      keywords:
        state.selectedKeywordIds.length > 0
          ? state.selectedKeywordIds
          : undefined,
      type: state.type,
      startDate: state.startDate,
      endDate: state.endDate,
    };
  }, [state, _query]);

  const onNodeClick = (e: any, n: Node): void => {
    switch (n.type) {
      case Actor.Actor.name: {
        const actorIds = state.selectedActorIds.includes(n.id)
          ? state.selectedActorIds.filter((aa) => aa !== n.id)
          : state.selectedActorIds.concat([n.id]);
        setState({
          ...state,
          ids: actorIds,
          selectedActorIds: actorIds,
        });
        break;
      }
      case Group.Group.name: {
        const groupIds = state.selectedGroupIds.includes(n.id)
          ? state.selectedGroupIds.filter((aa) => aa !== n.id)
          : state.selectedGroupIds.concat([n.id]);
        setState({
          ...state,
          selectedGroupIds: groupIds,
        });
        break;
      }
      case Keyword.Keyword.name: {
        const keywordIds = state.selectedKeywordIds.includes(n.id)
          ? state.selectedKeywordIds.filter((aa) => aa !== n.id)
          : state.selectedKeywordIds.concat([n.id]);
        setState({
          ...state,
          selectedKeywordIds: keywordIds,
        });
        break;
      }
      case "EventV2": {
        onEventClick(n.data);
        break;
      }
    }
  };

  return (
    <QueriesRenderer
      queries={(Q) => ({
        graph: Q.Graph.Custom.GetGraphByType.useQuery({ type, id }, query),
      })}
      render={({ graph: { data: graph } }) => {
        return (
          <Box
            height={"100%"}
            display="flex"
            flexDirection={"column"}
            width={"100%"}
          >
            <EventsAppBar
              query={query}
              events={graph.events}
              actors={graph.actors}
              groups={graph.groups}
              keywords={graph.keywords}
              groupsMembers={[]}
              dateRange={[graph.startDate, graph.endDate]}
              totals={graph.totals}
              onQueryChange={({ actors, groups, keywords, ...q }) => {
                setState((s) => ({
                  ...s,
                  ...q,
                  selectedActorIds: actors ?? [],
                  selectedGroupIds: groups ?? [],
                  selectedKeywordIds: keywords ?? [],
                }));
              }}
              onQueryClear={() => {}}
              layout={{
                eventTypes: 4,
                dateRangeBox: {
                  columns: 8,
                  variant: "slider",
                },
              }}
            />
            <EventsFlowGraph
              graph={graph}
              filters={{
                actors: state.selectedActorIds,
                groups: state.selectedGroupIds,
                keywords: state.selectedKeywordIds,
                minDate: graph.startDate,
                maxDate: graph.endDate,
              }}
              onNodeClick={onNodeClick}
            />
          </Box>
        );
      }}
    />
  );
};
