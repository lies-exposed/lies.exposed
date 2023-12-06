import { EventType } from "@liexp/shared/lib/io/http/Events";
import { type GetSearchEventsQueryInput } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEventsQuery";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import {
  clearSearchEventsQueryCache,
  type SearchEventQueryInput,
  type SearchEventsQueryInputNoPagination,
} from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import ExploreTemplate from "@liexp/ui/lib/templates/ExploreTemplate";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery,
} from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { queryClient } from "../state/queries";
import {
  useNavigateToResource,
  type EventsView,
} from "../utils/location.utils";

const useEventsPageQuery = (): GetSearchEventsQueryInput & {
  tab: number;
  slide?: string;
  hash: string;
} => {
  const query = useRouteQuery();

  const hashQuery = useQueryFromHash(query.hash);
  return React.useMemo(() => {
    return {
      ...query,
      ...hashQuery,
      tab: parseInt(query.tab ?? "0", 10),
    };
  }, [query]);
};

interface EventsPageProps extends Omit<EventsView, "view"> {}

const EventsPage: React.FC<EventsPageProps> = () => {
  const { hash, tab, ...query } = useEventsPageQuery();

  const navigateTo = useNavigateToResource();

  const params: Omit<SearchEventQueryInput, "_start" | "_end"> = {
    hash,
    startDate: query.startDate,
    endDate: query.endDate ?? formatDate(new Date()),
    actors: query.actors,
    groups: query.groups,
    keywords: query.keywords,
    groupsMembers: query.groupsMembers ?? [],
    media: query.media ?? [],
    locations: query.locations ?? [],
    eventType:
      (query.eventType as EventType[]) ?? EventType.types.map((t) => t.value),
    title: query.title,
    _order: query._order ?? "DESC",
    _sort: "date",
  };

  const slide = React.useMemo(
    () => parseInt(query.slide ?? "0", 10) === 1,
    [query],
  );

  const handleUpdateEventsSearch = React.useCallback(
    (
      { slide, ...update }: SearchEventsQueryInputNoPagination,
      tab: number,
    ): void => {
      clearSearchEventsQueryCache();
      void queryClient.invalidateQueries("events-search-infinite").then(() => {
        navigateTo.events(
          {},
          {
            hash: queryToHash({ ...params, ...update }),
            tab,
            slide: slide ? 1 : 0,
          },
        );
      });
    },
    [hash, tab, params, slide],
  );

  return (
    <ExploreTemplate
      hash={hash}
      params={params}
      tab={tab}
      onQueryChange={handleUpdateEventsSearch}
      onQueryClear={() => {
        navigateTo.events({}, {});
      }}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id });
      }}
    />
  );
};

export default EventsPage;
