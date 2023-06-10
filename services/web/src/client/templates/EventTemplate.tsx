import { EventType } from "@liexp/shared/lib/io/http/Events";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { useEventQuery } from "@liexp/ui/lib/state/queries/event.queries";
import { EventTemplateUI } from "@liexp/ui/lib/templates/EventTemplate";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0", ...query } = useRouteQuery();
  const tab = parseInt(_tab, 10);
  const filters = {
    actors: query.actors ?? [],
    groups: query.groups ?? [],
    keywords: query.keywords ?? [],
    eventType: query.eventType ?? EventType.types.map((v) => v.value),
  };

  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        event: useEventQuery({ id: eventId }),
      }}
      render={({ event }) => {
        return (
          <EventTemplateUI
            filters={filters}
            event={event}
            tab={tab}
            onTabChange={(tab) => {
              navigateTo.events({ id: event.id }, { tab });
            }}
            onDateClick={() => {}}
            onActorClick={(a) => {
              navigateTo.actors({ id: a.id }, { tab: 0 });
            }}
            onGroupClick={(a) => {
              navigateTo.groups({ id: a.id }, { tab: 0 });
            }}
            onAreaClick={(a) => {
              navigateTo.areas({ id: a.id }, { tab: 0 });
            }}
            onKeywordClick={(a) => {
              navigateTo.keywords({ id: a.id }, { tab: 0 });
            }}
            onLinkClick={() => {
              // navigateTo.actors({ id: a.id }, { tab });
            }}
            onMediaClick={(m) => {
              navigateTo.media({ id: m.id }, { tab: 0 });
            }}
            onGroupMemberClick={(g) => {
              navigateTo.actors({ id: g.actor.id }, { tab: 0 });
            }}
            onEventClick={(e) => {
              navigateTo.events({ id: e.id }, { tab: 0 });
            }}
          />
        );
      }}
    />
  );
};

export default EventTemplate;
