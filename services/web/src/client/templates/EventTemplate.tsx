import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { EventTemplateUI } from "@liexp/ui/lib/templates/EventTemplate.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";
import { toStringArray } from "../utils/query.utils.js";

const EventTemplate: React.FC<{ eventId: UUID }> = ({ eventId }) => {
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

  const filters = React.useMemo(() => {
    const eventType = rawQuery.eventType;
    return {
      actors: toStringArray(rawQuery.actors) as UUID[],
      groups: toStringArray(rawQuery.groups) as UUID[],
      keywords: toStringArray(rawQuery.keywords) as UUID[],
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
          : EventType.members.map((v) => v.literals[0]),
    };
  }, [rawQuery]);

  return (
    <QueriesRenderer
      loader="fullsize"
      queries={(Q) => ({
        event: Q.Event.get.useQuery({ id: eventId }),
      })}
      render={({ event: { data: event } }) => {
        return (
          <EventTemplateUI
            filters={filters}
            event={event}
            tab={tab}
            onTabChange={(tab) => {
              navigateTo.events({ id: event.id }, { tab: String(tab) });
            }}
            onDateClick={() => {}}
            onActorClick={(a) => {
              navigateTo.actors({ id: a.id }, { tab: "0" });
            }}
            onGroupClick={(a) => {
              navigateTo.groups({ id: a.id }, { tab: "0" });
            }}
            onAreaClick={(a) => {
              navigateTo.areas({ id: a.id }, { tab: "0" });
            }}
            onKeywordClick={(a) => {
              navigateTo.keywords({ id: a.id }, { tab: "0" });
            }}
            onLinkClick={(l) => {
              navigateTo.links({ id: l.id }, { tab: "0" });
            }}
            onMediaClick={(m) => {
              navigateTo.media({ id: m.id }, { tab: "0" });
            }}
            onGroupMemberClick={(g) => {
              navigateTo.actors({ id: g.actor.id }, { tab: "0" });
            }}
            onEventClick={(e) => {
              navigateTo.events({ id: e.id }, { tab: "0" });
            }}
          />
        );
      }}
    />
  );
};

export default EventTemplate;
