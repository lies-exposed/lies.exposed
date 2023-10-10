import { type Keyword, type Link } from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvent";
import * as React from "react";
import { KeywordsBox } from "../../components/KeywordsBox";
import MediaElement from "../../components/Media/MediaElement";
import { Box, Typography } from "../../components/mui";
import { EventsPanelBox } from "../../containers/EventsPanel";
import { SplitPageTemplate } from "../SplitPageTemplate";

export interface LinkTemplateUIProps {
  link: Link.Link;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
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
