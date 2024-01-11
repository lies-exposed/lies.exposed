import { type Keyword, type Media } from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent";
import * as React from "react";
import { KeywordsBox } from "../components/KeywordsBox";
import { LinksBox } from "../components/LinksBox";
import MediaElement from "../components/Media/MediaElement";
import { Box, Typography } from "../components/mui";
import EventsBox from "../containers/EventsBox";
import { EventsPanelBox } from "../containers/EventsPanel";
import { MediaBox } from "../containers/MediaBox";
import { SplitPageTemplate } from "./SplitPageTemplate";

export interface MediaTemplateUIProps {
  media: Media.Media;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onMediaClick: (m: Media.Media) => void;
}

export const MediaTemplateUI: React.FC<MediaTemplateUIProps> = ({
  media: m,
  tab,
  onTabChange,
  onEventClick,
  onKeywordClick,
  onMediaClick,
}) => {
  return (
    <SplitPageTemplate
      resource={{ name: "media", item: m }}
      aside={
        <Box
          width="100%"
          display="flex"
          flexDirection={"column"}
          paddingLeft={2}
        >
          <MediaElement
            media={m}
            itemStyle={{
              maxHeight: 200,
              minHeight: 200,
              width: "auto",
              maxWidth: "100%",
            }}
            disableZoom
            options={{
              iframe: { showPlay: false },
              video: { showPlay: false },
            }}
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
          itemStyle={{ maxHeight: 600, minHeight: 300, maxWidth: "100%" }}
        />
        <Box style={{ marginBottom: 100 }}>
          <Typography variant="h4" component="h1">
            {m.label ?? null}
          </Typography>
          <Typography style={{ marginBottom: 20 }}>{m.description}</Typography>
        </Box>
        <MediaBox
          filter={{ keywords: m.keywords }}
          onClick={onMediaClick}
          limit={3}
        />

        <EventsBox
          title="Events by keywords"
          query={{ keywords: m.keywords, _end: 3 }}
          onEventClick={onEventClick}
        />
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
