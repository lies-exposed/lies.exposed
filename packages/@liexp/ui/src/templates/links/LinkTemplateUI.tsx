import type * as http from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { KeywordsBox } from "../../components/KeywordsBox.js";
import MediaElement from "../../components/Media/MediaElement.js";
import { Box, Typography, Link } from "../../components/mui/index.js";
import { EventsPanelBox } from "../../containers/EventsPanel.js";
import { SplitPageTemplate } from "../SplitPageTemplate.js";

export interface LinkTemplateUIProps {
  link: http.Link.Link;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: http.Events.SearchEvent.SearchEvent) => void;
  onKeywordClick: (k: http.Keyword.Keyword) => void;
}

export const LinkTemplateUI: React.FC<LinkTemplateUIProps> = ({
  link,
  tab,
  onTabChange,
  onEventClick,
  onKeywordClick,
}) => {
  return (
    <SplitPageTemplate
      resource={{ name: "media", item: link }}
      aside={
        <Box>
          {link.image?.thumbnail ? (
            <MediaElement
              media={{
                ...link.image,
                events: [],
                links: [],
                keywords: [],
                featuredIn: [],
                areas: [],
                creator: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: undefined,
                extra: undefined,
                socialPosts: undefined,
              }}
              itemStyle={{ maxHeight: 200, minHeight: 200, width: "100%" }}
              disableZoom
            />
          ) : null}
          <KeywordsBox ids={link.keywords} onItemClick={onKeywordClick} />
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
          label: "Stories",
        },
      ]}
    >
      <Box style={{ padding: 10 }}>
        <Box style={{ paddingBottom: 10 }}>
          <Link href={link.url} target="_blank">
            {link.title}
          </Link>
        </Box>

        <Typography style={{ marginBottom: 20 }}>{link.description}</Typography>
      </Box>
      <EventsPanelBox
        query={{
          hash: `link-${link.id}`,
          media: [],
          links: [link.id],
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
    </SplitPageTemplate>
  );
};
