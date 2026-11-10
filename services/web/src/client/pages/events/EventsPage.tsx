import { type GetSearchEventsQueryInput } from "@liexp/io/lib/http/Events/SearchEvents/SearchEventsQuery.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import {
  clearSearchEventsQueryCache,
  type SearchEventQueryInput,
  type SearchEventsQueryInputNoPagination,
} from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import ExploreTemplate from "@liexp/ui/lib/templates/ExploreTemplate.js";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery,
} from "@liexp/ui/lib/utils/history.utils.js";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
  useNavigateToResource,
  type EventsView,
} from "../../utils/location.utils.js";
import { toString, toStringArray } from "../../utils/query.utils.js";

const useEventsPageQuery = (): GetSearchEventsQueryInput & {
  tab: number;
  slide?: string;
  hash: string;
} => {
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();

  const hashQuery = useQueryFromHash<
    GetSearchEventsQueryInput & {
      tab: number;
      slide?: string;
      hash: string;
    }
  >(typeof rawQuery.tab === "string" ? rawQuery.tab : "");
  return React.useMemo(() => {
    // Extract tab from raw query and convert to number
    const rawTab = rawQuery.tab;
    const tab =
      typeof rawTab === "string"
        ? parseInt(rawTab, 10)
        : rawTab !== undefined && rawTab.length > 0
          ? parseInt(rawTab[0], 10)
          : 0;

    // Build query object with proper types
    const query = {
      actors: toStringArray(rawQuery.actors),
      groups: toStringArray(rawQuery.groups),
      groupsMembers: toStringArray(rawQuery.groupsMembers),
      keywords: toStringArray(rawQuery.keywords),
      media: toStringArray(rawQuery.media),
      locations: toStringArray(rawQuery.locations),
      startDate: toString(rawQuery.startDate),
      endDate: toString(rawQuery.endDate),
      eventType:
        rawQuery.eventType !== undefined
          ? (toStringArray(rawQuery.eventType) as (
              | "Book"
              | "Death"
              | "Documentary"
              | "Patent"
              | "Quote"
              | "ScientificStudy"
              | "Transaction"
              | "Uncategorized"
            )[])
          : undefined,
      q: toString(rawQuery.q),
      _order: toString(rawQuery._order) as "ASC" | "DESC" | null | undefined,
      _sort: toString(rawQuery._sort),
    } as unknown as GetSearchEventsQueryInput;

    return {
      ...query,
      ...hashQuery,
      tab,
      hash: toString(rawQuery.hash),
    };
  }, [rawQuery]);
};

type EventsPageProps = Omit<EventsView, "view">;

const EventsPage: React.FC<EventsPageProps> = () => {
  const { hash, tab, ...query } = useEventsPageQuery();

  const queryClient = useQueryClient();
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
    eventType: query.eventType ?? EventType.members.map((t) => t.literals[0]),
    q: query.q,
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
      void queryClient
        .invalidateQueries({ queryKey: ["events-search-infinite"] })
        .then(() => {
          navigateTo.events(
            {},
            {
              hash: queryToHash({ ...params, ...update }),
              tab: String(tab),
              slide: slide ? "1" : "0",
            },
          );
        });
    },
    [hash, tab, params, slide],
  );

  return (
    <ExploreTemplate
      hash={hash}
      params={params as any}
      tab={tab}
      slide={slide}
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
