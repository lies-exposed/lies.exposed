import { type Keyword, type Media } from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { type SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import * as React from "react";
import EditButton from "../components/Common/Button/EditButton";
import { a11yProps, TabPanel } from "../components/Common/TabPanel";
import { KeywordsBox } from "../components/KeywordsBox";
import { LinksBox } from "../components/LinksBox";
import { MainContent } from "../components/MainContent";
import { Box, Tab, Tabs, Typography } from "../components/mui";
import { MediaSlider } from "../components/sliders/MediaSlider";
import { EventsPanel } from "../containers/EventsPanel";

export interface MediaTemplateUIProps {
  media: Media.Media;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
}

export const MediaTemplateUI: React.FC<MediaTemplateUIProps> = ({
  media: m,
  tab,
  onTabChange,
  onEventClick,
  onKeywordClick,
}) => {
  return (
    <Box>
      <MainContent>
        <EditButton resourceName="media" resource={m} admin={true} />
        <Box style={{ padding: 10 }}>
          <MediaSlider data={[m]} onClick={() => undefined} />
          <Typography>{m.description}</Typography>
          <KeywordsBox ids={m.keywords} onItemClick={onKeywordClick} />
        </Box>
      </MainContent>
      <Tabs
        value={tab}
        onChange={(e, v) => {
          onTabChange(v);
        }}
      >
        <Tab label="Events" {...a11yProps(0)} />
        <Tab label="Links" {...a11yProps(1)} />
      </Tabs>
      <Box>
        <TabPanel index={0} value={tab}>
          <EventsPanel
            keywords={[]}
            actors={[]}
            groups={[]}
            slide={false}
            groupsMembers={[]}
            query={{
              hash: `media-${m.id}`,
              startDate: undefined,
              endDate: new Date().toDateString(),
              media: [m.id],
              actors: [],
              groups: [],
              groupsMembers: [],
              keywords: [],
              locations: [],
              type: EventType.types.map((t) => t.value),
              _sort: "date",
              _order: "DESC",
            }}
            tab={0}
            onQueryChange={(q, tab) => {}}
            onEventClick={onEventClick}
          />
        </TabPanel>
        <TabPanel index={1} value={tab}>
          <LinksBox filter={{ ids: m.links }} onClick={() => {}} />
        </TabPanel>
      </Box>
    </Box>
  );
};
