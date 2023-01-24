import { type Area } from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { type SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import * as React from "react";
import { AreaPageContent } from "../components/AreaPageContent";
import { Box } from "../components/mui";
import { EventsPanel } from "../containers/EventsPanel";

export interface AreaTemplateProps {
  area: Area.Area;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onAreaClick: (k: Area.Area) => void;
}

export const AreaTemplateUI: React.FC<AreaTemplateProps> = ({
  area,
  tab,
  onTabChange,
  onEventClick,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      style={{ paddingTop: 20 }}
    >
      <AreaPageContent area={area} onGroupClick={() => {}} />
      <EventsPanel
        slide={false}
        keywords={[]}
        actors={[]}
        groups={[]}
        groupsMembers={[]}
        query={{
          hash: `area-${area.id}`,
          startDate: undefined,
          endDate: new Date().toDateString(),
          actors: [],
          groups: [],
          groupsMembers: [],
          media: [],
          keywords: [],
          locations: [area.id],
          type: EventType.types.map((t) => t.value),
          _sort: "createdAt",
          _order: "DESC",
        }}
        tab={0}
        onQueryChange={(q, tab) => {
          // navigateToResource.area({ id: actor.id }, { tab });
        }}
        onEventClick={(e) => {}}
      />
    </Box>
  );
};
