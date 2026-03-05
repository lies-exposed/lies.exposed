import { type SearchEvent } from "@liexp/io/lib/http/Events/SearchEvents/SearchEvent.js";
import { type Keyword, type Media } from "@liexp/io/lib/http/index.js";
import * as React from "react";
import { KeywordsBox } from "../components/KeywordsBox.js";
import MediaElement from "../components/Media/MediaElement.js";
import { Box, Chip, Typography } from "../components/mui/index.js";
import EventsBox from "../containers/EventsBox.js";
import { EventsPanelBox } from "../containers/EventsPanel.js";
import { MediaBox } from "../containers/MediaBox.js";
import { LinksBox } from "../containers/link/LinksBox.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

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
  const hasKeywords = m.keywords.length > 0;
  const randomOffset = React.useMemo(
    () => (hasKeywords ? 0 : Math.floor(Math.random() * 50)),
    [m.id],
  );

  return (
    <SplitPageTemplate
      resource={{ name: "media", item: m }}
      aside={
        <Box
          width="100%"
          display="flex"
          flexDirection={"column"}
          paddingLeft={2}
          paddingTop={1}
          gap={1}
        >
          <MediaElement
            media={m}
            itemStyle={{
              maxHeight: 250,
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
          <Chip
            size="small"
            label={m.type.split("/").pop()?.toUpperCase() ?? m.type}
            sx={{ alignSelf: "flex-start" }}
          />
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
      <Box sx={{ padding: 1.25 }}>
        <Box sx={{ marginBottom: { xs: 4, sm: 6, md: 8 }, maxWidth: 640 }}>
          <MediaElement
            media={m}
            enableDescription={false}
            disableZoom
            options={{ iframe: { showPlay: true }, video: { showPlay: true } }}
            itemStyle={{
              maxHeight: 400,
              minHeight: 250,
              maxWidth: "100%",
              width: "100%",
            }}
          />
        </Box>
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h3" component="h1">
            {m.label ?? null}
          </Typography>
          <Typography sx={{ marginBottom: 2.5 }}>{m.description}</Typography>
        </Box>
        <Box sx={{ marginTop: 6, marginBottom: 4 }}>
          <Typography variant="h5" sx={{ marginBottom: 1.5 }}>
            {hasKeywords ? "Related media by keywords" : "Other media"}
          </Typography>
          <MediaBox
            filter={{ keywords: m.keywords, _start: String(randomOffset) }}
            onClick={onMediaClick}
            limit={6}
            layout="horizontal"
            itemStyle={{ height: 300 }}
          />
        </Box>

        <Box sx={{ marginTop: 4, marginBottom: 4 }}>
          <EventsBox
            title={hasKeywords ? "Related events by keywords" : "Recent events"}
            query={{ keywords: m.keywords, _start: randomOffset, _end: randomOffset + 6 }}
            onEventClick={onEventClick}
          />
        </Box>
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
        onQueryChange={(_q, _tab) => {}}
        onEventClick={onEventClick}
      />
      <LinksBox filter={{ ids: m.links }} onItemClick={() => {}} />
    </SplitPageTemplate>
  );
};
