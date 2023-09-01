import { type Keyword, type Media } from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvent";
import * as React from "react";
import { KeywordsBox } from "../components/KeywordsBox";
import { LinksBox } from "../components/LinksBox";
import MediaElement from "../components/Media/MediaElement";
import { Box, Typography } from "../components/mui";
import { EventsPanelBox } from "../containers/EventsPanel";
import { SplitPageTemplate } from "./SplitPageTemplate";

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
    <SplitPageTemplate
      resource={{ name: "media", item: m }}
      aside={
        <Box>
          <MediaElement
            media={m}
            itemStyle={{ maxHeight: 200, minHeight: 200, width: "100%" }}
            disableZoom
          />
          <Typography>{m.type}</Typography>
          <KeywordsBox ids={m.keywords} onItemClick={onKeywordClick} />
        </Box>
      }
      tab={tab}
      onTabChange={onTabChange}
      tabs={[
        {
          label: "General",
        },
        {
          label: "Events",
        },
        {
          label: "Links",
        },
      ]}
    >
      <Box style={{ padding: 10 }}>
        <MediaElement
          media={m}
          enableDescription={false}
          style={{ marginBottom: 80 }}
          itemStyle={{ maxHeight: 600, minHeight: 300 }}
        />
        <Typography style={{ marginBottom: 20 }}>{m.description}</Typography>
      </Box>
      <EventsPanelBox
        query={{
          hash: `media-${m.id}`,
          media: [m.id],
          actors: [],
          groups: [],
          groupsMembers: [],
          keywords: [],
          locations: [],
          _sort: "date",
          _order: "DESC",
        }}
        tab={0}
        onQueryChange={(q, tab) => {}}
        onEventClick={onEventClick}
      />
      <LinksBox filter={{ ids: m.links }} onItemClick={() => {}} />
    </SplitPageTemplate>
  );
};
