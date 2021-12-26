import { Events } from "@econnessione/shared/io/http";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  EventsNetworkGraph,
  EventsNetworkGraphProps,
} from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { eventNetworkList, InfiniteEventListParams } from "../state/queries";

interface EventsNetworkProps
  extends Omit<
    EventsNetworkGraphProps,
    | "events"
    | "actors"
    | "groups"
    | "groupsMembers"
    | "keywords"
    | "selectedActorIds"
    | "selectedGroupIds"
    | "selectedKeywordIds"
  > {
  filter: Omit<InfiniteEventListParams, "page">;
}

export const EventsNetwork: React.FC<EventsNetworkProps> = ({
  filter,
  ...props
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const eventsFilter = {
    ...filter,
    page: currentPage,
  };
  return (
    <WithQueries
      queries={{ events: eventNetworkList }}
      params={{
        events: eventsFilter,
      }}
      render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events }) => {
        return (
          <WithQueries
            queries={{
              actors: Queries.Actor.getList,
              groups: Queries.Group.getList,
              keywords: Queries.Keyword.getList,
            }}
            params={{
              actors: {
                pagination: {
                  page: 1,
                  perPage: filter.actors?.length ?? 0,
                },
                sort: { field: "createdAt", order: "DESC" },
                filter: {
                  ids: filter.actors,
                },
              },
              groups: {
                pagination: {
                  page: 1,
                  perPage: filter.groups?.length ?? 0,
                },
                sort: { field: "createdAt", order: "DESC" },
                filter: {
                  ids: filter.groups,
                },
              },
              keywords: {
                pagination: {
                  page: 1,
                  perPage: filter.keywords?.length ?? 0,
                },
                sort: { field: "createdAt", order: "DESC" },
                filter: {
                  ids: filter.keywords,
                },
              },
            }}
            render={QR.fold(
              LazyFullSizeLoader,
              ErrorBox,
              ({ actors, groups, keywords }) => {
                return (
                  <EventsNetworkGraph
                    {...props}
                    events={pipe(
                      events.data,
                      A.filter(Events.Uncategorized.Uncategorized.is)
                    )}
                    actors={actors.data}
                    groups={groups.data}
                    keywords={keywords.data}
                    selectedActorIds={filter.actors ?? []}
                    selectedGroupIds={filter.groups ?? []}
                    selectedKeywordIds={filter.keywords ?? []}
                  />
                );
              }
            )}
          />
        );
      })}
    />
  );
};
