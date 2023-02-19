import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useEventQuery } from "@liexp/ui/state/queries/event.queries";
import { EventTemplateUI } from "@liexp/ui/templates/EventTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigateTo = useNavigateToResource();
  const { tab: _tab = "0" } = useRouteQuery();
  const tab = parseInt(_tab, 10);

  return (
    <QueriesRenderer
      loader="fullsize"
      queries={{
        event: useEventQuery({ id: eventId }),
      }}
      render={({ event }) => {
        return (
          <EventTemplateUI
            event={event}
            tab={tab}
            onTabChange={(tab) => {
              navigateTo.events({ id: event.id }, { tab: 0 });
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
              navigateTo.actors({ id: g.actor.id });
            }}
          />
        );
      }}
    />
  );
};

export default EventTemplate;
