import { type Actor, type Group, type Keyword, type Media } from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { ParentSize } from "@visx/responsive";
import * as React from "react";
import { KeywordHierarchyEdgeBundlingGraph } from "../components/Graph/KeywordHierarchyEdgeBundlingGraph";
import { LinksListBox } from "../components/LinksBox";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { MediaBox } from "../components/containers/MediaBox";
import { Box } from "../components/mui";
import { EventsPanelBox } from "../containers/EventsPanel";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { useKeywordQuery } from "../state/queries/DiscreteQueries";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
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
              name={`#${keyword.tag}`}
              tabs={[
                { label: "Events" },
                { label: "Media" },
                { label: "Links" },
                // { label: "Hierarchy" },
                { label: "Networks" },
              ]}
              resource={{
                name: KEYWORDS.value,
                item: keyword,
              }}
            >
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
                onClick={() => {}}
                layout={{
                  sm: 6,
                  md: 6,
                  lg: 6,
                }}
              />
              <Box style={{ height: 600 }}>
                <EventNetworkGraphBox
                  type={KEYWORDS.value}
                  id={keyword.id}
                  query={{
                    groupBy: ACTORS.value,
                  }}
                  relation={GROUPS.value}
                  onKeywordClick={onKeywordClick}
                  onEventClick={onEventClick}
                  onActorClick={onActorClick}
                  onGroupClick={onGroupClick}
                />
              </Box>
              <ParentSize style={{ maxWidth: 400, minWidth: 200 }}>
                {({ width }) => {
                  return (
                    <KeywordHierarchyEdgeBundlingGraph
                      keyword={keyword.id}
                      width={width}
                      onNodeClick={(n) => {
                        onKeywordClick(n.data);
                      }}
                      onLinkClick={([firstK, secondK]) => {
                        // navigateToResource.events(
                        //   {},
                        //   {
                        //     hash: queryToHash({
                        //       keywords: [firstK.data.id, secondK.data.id],
                        //     }),
                        //   }
                        // );
                      }}
                    />
                  );
                }}
              </ParentSize>
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};
