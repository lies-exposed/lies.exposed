import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { GroupTemplate } from "@liexp/ui/lib/templates/GroupTemplate.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";
import { toString, toStringArray } from "../utils/query.utils.js";

const GroupPage: React.FC<{ groupId: UUID }> = ({ groupId }) => {
  const navigateTo = useNavigateToResource();
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();
  const tab = React.useMemo(() => {
    const rawTab = rawQuery.tab;
    return typeof rawTab === "string"
      ? parseInt(rawTab, 10)
      : rawTab !== undefined && rawTab.length > 0
        ? parseInt(rawTab[0], 10)
        : 0;
  }, [rawQuery.tab]);

  const query = React.useMemo(() => {
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
      _order: toString(rawQuery._order),
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
    <QueriesRenderer
      queries={(Q) => ({ group: Q.Group.get.useQuery({ id: groupId }) })}
      render={({ group: { data: group } }) => {
        return (
          <GroupTemplate
            group={group}
            tab={tab}
            query={query}
            onTabChange={(t) => {
              navigateTo.groups({ id: groupId }, { tab: String(t) });
            }}
            onQueryChange={() => {
              navigateTo.groups({ id: groupId }, { tab: String(tab) });
            }}
            onEventClick={(e) => {
              navigateTo.events({ id: e.id }, { tab: "0" });
            }}
            onKeywordClick={(k) => {
              navigateTo.keywords(
                { id: k.id },
                {
                  tab: "0",
                },
              );
            }}
            onActorClick={(a) => {
              navigateTo.actors({ id: a.id }, { tab: "0" });
            }}
            onGroupClick={(g) => {
              navigateTo.groups({ id: g.id }, { tab: "0" });
            }}
          />
        );
      }}
    />
  );
};

export default GroupPage;
