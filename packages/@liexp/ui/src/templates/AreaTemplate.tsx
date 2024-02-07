import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Media, type Area } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { subYears } from "date-fns";
import Feature from "ol/Feature.js";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import { AreaPageContent } from "../components/AreaPageContent.js";
import Map from "../components/Map.js";
import { Box, Typography } from "../components/mui/index.js";
import { EventsPanel } from "../containers/EventsPanel.js";
import { geoJSONFormat } from "../utils/map.utils.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

export interface AreaTemplateProps {
  area: Area.Area;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onMediaClick: (m: Media.Media) => void;
}

export const AreaTemplateUI: React.FC<AreaTemplateProps> = ({
  area,
  tab,
  onTabChange,
  onEventClick,
  onMediaClick,
}) => {
  const { features } = React.useMemo(() => {
    if (area) {
      const features = [area].map(({ geometry, ...datum }) => {
        const geom = geoJSONFormat.readGeometry(geometry);
        const feature = new Feature(geom);
        feature.setProperties(datum);
        return feature;
      });
      // const totalArea = calculateAreaInSQM([area]);
      return { features };
    }
    return { features: [] };
  }, []);

  return (
    <SplitPageTemplate
      tab={tab}
      onTabChange={onTabChange}
      aside={
        <AutoSizer style={{ width: "100%", height: "100%" }}>
          {({ width }) => {
            return (
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  textAlign: "right",
                  width: "100%",
                }}
              >
                <Typography variant="h3">{area.label}</Typography>
                <Map
                  id={`area-${area.id}`}
                  width={width - width * 0.1}
                  height={200}
                  features={features}
                  center={[9.18951, 45.46427]}
                  zoom={12}
                  onMapClick={() => {}}
                  controls={{
                    zoom: false,
                  }}
                />
              </Box>
            );
          }}
        </AutoSizer>
      }
      resource={{ name: "areas", item: area }}
      tabs={[
        {
          label: "General",
        },
        {
          label: "Events",
        },
      ]}
    >
      <AreaPageContent area={area} onMediaClick={onMediaClick} />
      <EventsPanel
        keywords={[]}
        actors={[]}
        groups={[]}
        groupsMembers={[]}
        query={{
          hash: `area-${area.id}`,
          startDate: formatDate(subYears(new Date(), 2)),
          endDate: formatDate(new Date()),
          actors: [],
          groups: [],
          groupsMembers: [],
          media: [],
          keywords: [],
          locations: [area.id],
          eventType: EventType.types.map((t) => t.value),
          _sort: "createdAt",
          _order: "DESC",
        }}
        tab={0}
        onQueryChange={(q, tab) => {
          // navigateToResource.area({ id: actor.id }, { tab });
        }}
        onEventClick={onEventClick}
      />
    </SplitPageTemplate>
  );
};
