import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { KeywordTemplate } from "@liexp/ui/lib/templates/KeywordTemplate.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";
import { toString, toStringArray } from "../utils/query.utils.js";

const KeywordPage: React.FC<{ keywordId: UUID }> = ({ keywordId }) => {
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();
  const navigateTo = useNavigateToResource();

  const tab = React.useMemo(() => {
    const rawTab = rawQuery.tab;
    return typeof rawTab === "string"
      ? parseInt(rawTab, 10)
      : rawTab !== undefined && rawTab.length > 0
        ? parseInt(rawTab[0], 10)
        : 0;
  }, [rawQuery.tab]);

  const query = React.useMemo((): SearchEventsQueryInputNoPagination => {
    const eventType = rawQuery.eventType;
    return {
      actors: toStringArray(rawQuery.actors) as UUID[],
      groups: toStringArray(rawQuery.groups) as UUID[],
      groupsMembers: toStringArray(rawQuery.groupsMembers) as UUID[],
      keywords: toStringArray(rawQuery.keywords) as UUID[],
      media: toStringArray(rawQuery.media) as UUID[],
      locations: toStringArray(rawQuery.locations) as UUID[],
      startDate: toString(rawQuery.startDate),
      endDate: toString(rawQuery.endDate),
      eventType:
        eventType !== undefined
          ? (toStringArray(eventType) as (
              | "Book"
              | "Death"
              | "Documentary"
              | "Patent"
              | "Quote"
              | "ScientificStudy"
              | "Transaction"
              | "Uncategorized"
            )[])
          : EventType.members.map((t) => t.literals[0]),
      q: toString(rawQuery.q),
      _order: toString(rawQuery._order) as "ASC" | "DESC" | null | undefined,
      _sort: toString(rawQuery._sort),
      hash: toString(rawQuery.hash),
      slide:
        rawQuery.slide !== undefined
          ? toString(rawQuery.slide) === "1"
            ? true
            : false
          : undefined,
    };
  }, [rawQuery]);

  return (
    <KeywordTemplate
      id={keywordId}
      tab={tab}
      query={query}
      onTabChange={(tab) => {
        navigateTo.keywords({ id: keywordId }, { tab: String(tab) });
      }}
      onKeywordClick={(k) => {
        navigateTo.keywords(
          { id: k.id },
          {
            tab: "1",
          },
        );
      }}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id }, { tab: "0" });
      }}
      onMediaClick={(m) => {
        navigateTo.media({ id: m.id }, { tab: "0" });
      }}
      onActorClick={(m) => {
        navigateTo.actors({ id: m.id }, { tab: "0" });
      }}
      onGroupClick={(g) => {
        navigateTo.groups({ id: g.id }, { tab: "0" });
      }}
      onQueryChange={() => {
        navigateTo.keywords({ id: keywordId }, { tab: String(tab) });
      }}
    />
  );
};

export default KeywordPage;
