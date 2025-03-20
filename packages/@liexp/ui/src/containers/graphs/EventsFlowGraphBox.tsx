import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type EventType,
  type SearchEvent,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type GetNetworkQuerySerialized } from "@liexp/shared/lib/io/http/Network/Network.js";
import { type FlowGraphType } from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import { Actor, Group, Keyword } from "@liexp/shared/lib/io/http/index.js";
import {
  nonEmptyArrayOr,
  type NonEmptyArray,
} from "@liexp/shared/lib/utils/array.utils.js";
import { type Node } from "@xyflow/react";
import * as React from "react";
import { FullSizeLoader } from "../../components/Common/FullSizeLoader.js";
import { EventsFlowGraph } from "../../components/Graph/EventsFlowGraph.js";
import EventsAppBar from "../../components/events/filters/EventsAppBar.js";
import { Box } from "../../components/mui/index.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";

export interface EventsFlowGraphBoxProps {
  id: UUID;
  type: FlowGraphType;
  query: Partial<GetNetworkQuerySerialized>;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const EventsFlowGraphBox: React.FC<EventsFlowGraphBoxProps> = ({
  query: _query,
  type,
  id,
  onEventClick,
}) => {
  const { Queries } = useEndpointQueries();

  const [state, setState] = React.useState<{
    startDate: string | undefined;
    endDate: string | undefined;
    ids: readonly UUID[];
    type: readonly EventType[] | string | undefined;
    selectedActorIds: readonly UUID[];
    selectedGroupIds: readonly UUID[];
    selectedKeywordIds: readonly UUID[];
  }>({
    startDate: _query.startDate ?? undefined,
    endDate: _query.endDate ?? undefined,
    type,
    ids: nonEmptyArrayOr(_query.ids as UUID[] | undefined, [] as UUID[]),
    selectedActorIds: nonEmptyArrayOr(
      _query.actors as UUID[] | undefined,
      [] as UUID[],
    ),
    selectedGroupIds: nonEmptyArrayOr(
      _query.groups as UUID[] | undefined,
      [] as UUID[],
    ),
    selectedKeywordIds: nonEmptyArrayOr(
      _query.keywords as UUID[] | undefined,
      [] as UUID[],
    ),
  });

  const query = React.useMemo(() => {
    return {
      hash: "events-flow-graph",
      ids: _query.ids ?? undefined,
      actors: (state.selectedActorIds.length > 0
        ? state.selectedActorIds
        : _query.actors) as NonEmptyArray<UUID>,
      groups: (state.selectedGroupIds.length > 0
        ? state.selectedGroupIds
        : _query.groups) as NonEmptyArray<string>,
      keywords:
        ((state.selectedKeywordIds.length > 0
          ? state.selectedKeywordIds
          : _query.keywords) as NonEmptyArray<string>) ?? undefined,
      type: state.type,
      startDate: state.startDate,
      endDate: state.endDate,
    };
  }, [state, _query]);

  const onNodeClick = (e: any, n: Node): void => {
    switch (n.type) {
      case Actor.Actor.name: {
        const actorIds = state.selectedActorIds.includes(n.id as UUID)
          ? state.selectedActorIds.filter((aa) => aa !== n.id)
          : state.selectedActorIds.concat([n.id as UUID]);
        setState({
          ...state,
          ids: actorIds,
          selectedActorIds: actorIds,
        });
        break;
      }
      case Group.Group.name: {
        const groupIds = state.selectedGroupIds.includes(n.id as UUID)
          ? state.selectedGroupIds.filter((aa) => aa !== n.id)
          : state.selectedGroupIds.concat([n.id as UUID]);
        setState({
          ...state,
          selectedGroupIds: groupIds,
        });
        break;
      }
      case Keyword.Keyword.name: {
        const keywordIds = state.selectedKeywordIds.includes(n.id as UUID)
          ? state.selectedKeywordIds.filter((aa) => aa !== n.id)
          : state.selectedKeywordIds.concat([n.id as UUID]);
        setState({
          ...state,
          selectedKeywordIds: keywordIds,
        });
        break;
      }
      case "EventV2": {
        onEventClick(n.data as any);
        break;
      }
    }
  };

  const { data, isLoading } = Queries.Graph.Custom.GetGraphByType.useQuery(
    { type, id },
    query,
  );

  const graph = data?.data;

  if (isLoading || !graph) {
    return <FullSizeLoader />;
  }

  const filters = {
    actors: state.selectedActorIds,
    groups: state.selectedGroupIds,
    keywords: state.selectedKeywordIds,
    minDate: graph.startDate,
    maxDate: graph.endDate,
  };

  return (
    <Box height={"100%"} display="flex" flexDirection={"column"} width={"100%"}>
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
          setState(
            (s) =>
              ({
                ...s,
                ...q,
                ids: q.ids ?? s.ids ?? undefined,
                startDate: q.startDate ?? s.startDate ?? undefined,
                endDate: q.endDate ?? s.endDate ?? undefined,
                selectedActorIds: actors ?? [],
                selectedGroupIds: groups ?? [],
                selectedKeywordIds: keywords ?? [],
              }) as any,
          );
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
      {graph ? (
        <EventsFlowGraph
          graph={graph}
          filters={filters}
          onNodeClick={onNodeClick}
          fitView
          style={{ minHeight: 600 }}
        />
      ) : null}
    </Box>
  );
};
