import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvent";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import { formatDate } from "@liexp/shared/lib/utils/date";
import subYears from "date-fns/subYears";
import * as React from "react";
import { LinksListBox } from "../components/LinksBox";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box, Grid } from "../components/mui";
import { EventsPanelBox } from "../containers/EventsPanel";
import { MediaBox } from "../containers/MediaBox";
import { StatsPanelBox } from "../containers/StatsPanelBox";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventNetworkGraphBox";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { useKeywordQuery } from "../state/queries/keywords.queries";
import { SplitPageTemplate } from "./SplitPageTemplate";

export interface KeywordTemplateProps {
  id: string;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onActorClick: (k: Actor.Actor) => void;
  onGroupClick: (k: Group.Group) => void;
  onMediaClick: (m: Media.Media) => void;
  query: SearchEventsQueryInputNoPagination;
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
}

export const KeywordTemplate: React.FC<KeywordTemplateProps> = ({
  id: keywordId,
  tab,
  onTabChange,
  onKeywordClick,
  onEventClick,
  onMediaClick,
  onActorClick,
  onGroupClick,
  query,
  onQueryChange,
}) => {
  return (
    <QueriesRenderer
      queries={{ keyword: useKeywordQuery({ id: keywordId }) }}
      render={({ keyword }) => {
        return (
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
            style={{ paddingTop: 20 }}
          >
            <SEO
              title={`#${keyword.tag}`}
              urlPath={`keywords/${keyword.tag}`}
            />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              aside={{ name: `#${keyword.tag}` }}
              tabs={[
                { label: "General" },
                { label: "Events" },
                { label: "Media" },
                { label: "Links" },
                { label: "Networks" },
              ]}
              resource={{
                name: KEYWORDS.value,
                item: keyword,
              }}
            >
              <Box>
                <Grid container>
                  <Grid item md={6} />
                  <Grid item md={6}>
                    <StatsPanelBox
                      type="keywords"
                      id={keywordId}
                      onActorClick={onActorClick}
                      onGroupClick={onGroupClick}
                      onKeywordClick={onKeywordClick}
                    />
                  </Grid>
                </Grid>
              </Box>
              <EventsPanelBox
                tab={tab}
                slide={false}
                query={{
                  ...query,
                  hash: `keyword-${keywordId}`,
                  keywords: query.keywords
                    ? [...query.keywords, keyword.id]
                    : [keyword.id],
                }}
                onQueryChange={onQueryChange}
                onEventClick={onEventClick}
              />
              <MediaBox
                filter={{ keywords: [keyword.id] }}
                onClick={onMediaClick}
              />
              <LinksListBox
                filter={{ keywords: [keyword.id] }}
                onItemClick={() => {}}
                column={2}
              />

              <EventNetworkGraphBoxWithFilters
                type={KEYWORDS.value}
                query={{
                  ids: [keyword.id],
                  startDate: formatDate(subYears(new Date(), 2)),
                  endDate: formatDate(new Date()),
                }}
                relations={[GROUPS.value, ACTORS.value]}
                onKeywordClick={onKeywordClick}
                onEventClick={onEventClick}
                onActorClick={onActorClick}
                onGroupClick={onGroupClick}
                onQueryChange={() => {}}
              />
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};
