import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { subYears } from "date-fns";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import { Box, Grid } from "../components/mui/index.js";
import { EventsPanelBox } from "../containers/EventsPanel.js";
import { MediaBox } from "../containers/MediaBox.js";
import { StatsPanelBox } from "../containers/StatsPanelBox.js";
import { EventsFlowGraphBox } from "../containers/graphs/EventsFlowGraphBox.js";
import { EventNetworkGraphBoxWithFilters } from "../containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { LinksListBox } from "../containers/link/LinksListBox.js";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

export interface KeywordTemplateProps {
  id: UUID;
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
      queries={(Q) => ({ keyword: Q.Keyword.get.useQuery({ id: keywordId }) })}
      render={({ keyword: { data: keyword } }) => {
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
              aside={{ id: keyword.id, name: `#${keyword.tag}` }}
              tabs={[
                { label: "General" },
                { label: "Flow" },
                { label: "Events" },
                { label: "Media" },
                { label: "Links" },
                { label: "Networks" },
              ]}
              resource={{
                name: KEYWORDS.literals[0],
                item: keyword,
              }}
            >
              <Box style={{ height: "100%" }}>
                <Grid container style={{ height: "100%" }}>
                  <Grid item md={8}></Grid>
                  <Grid item md={4}>
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

              <EventsFlowGraphBox
                type="keywords"
                id={keyword.id}
                query={{}}
                onEventClick={onEventClick}
              />

              <EventsPanelBox
                tab={tab}
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
                column={3}
              />

              <EventNetworkGraphBoxWithFilters
                type={KEYWORDS.Type}
                query={{
                  ids: [keyword.id],
                  startDate: formatDate(subYears(new Date(), 2)),
                  endDate: formatDate(new Date()),
                }}
                relations={[GROUPS.literals[0], ACTORS.literals[0]]}
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
