import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import { KeywordTemplate } from "@liexp/ui/lib/templates/KeywordTemplate.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const KeywordPage: React.FC<{ keywordId: UUID }> = ({ keywordId }) => {
  const { tab: _tab = "0", ...query } = useRouteQuery() as Record<string, string | string[]>;
  const navigateTo = useNavigateToResource();

  const tab = React.useMemo(
    () =>
      typeof _tab === 'string'
        ? parseInt(_tab, 10)
        : _tab != null
          ? parseInt(String(_tab[0]), 10)
          : 0,
    [_tab],
  );

  return (
    <KeywordTemplate
      id={keywordId}
      tab={tab}
      query={
        {
          actors: query.actors ?? [],
          groups: query.groups ?? [],
          keywords: query.keywords ?? [],
          groupsMembers: query.groupsMembers ?? [],
          media: query.media ?? [],
          locations: query.locations ?? [],
          _start: query._start ?? undefined,
          _end: query._end ?? undefined,
          _sort: query._sort ?? undefined,
          _order: query._order ?? undefined,
          startDate: query.startDate ?? undefined,
          endDate: query.endDate ?? undefined,
          eventType:
            query.eventType ??
            EventType.members.map((t) => t.literals[0]),
          q: query.q ?? undefined,
          hash: undefined,
        } as unknown as SearchEventsQueryInputNoPagination
      }
      onTabChange={(tab) => {
        navigateTo.keywords({ id: keywordId }, { tab });
      }}
      onKeywordClick={(k) => {
        navigateTo.keywords(
          { id: k.id },
          {
            tab: 1,
          },
        );
      }}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id }, { tab: 0 });
      }}
      onMediaClick={(m) => {
        navigateTo.media({ id: m.id }, { tab: 0 });
      }}
      onActorClick={(m) => {
        navigateTo.actors({ id: m.id }, { tab: 0 });
      }}
      onGroupClick={(g) => {
        navigateTo.groups({ id: g.id }, { tab: 0 });
      }}
      onQueryChange={(q) => {
        navigateTo.keywords({ id: keywordId }, { ...q, tab });
      }}
    />
  );
};

export default KeywordPage;
