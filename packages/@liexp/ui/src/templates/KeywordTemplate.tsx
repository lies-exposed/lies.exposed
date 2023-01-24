import { type Keyword } from "@liexp/shared/io/http";
import { type SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { ParentSize } from "@visx/responsive";
import * as React from "react";
import { KeywordHierarchyEdgeBundlingGraph } from "../components/Graph/KeywordHierarchyEdgeBundlingGraph";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
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
  query: SearchEventsQueryInputNoPagination;
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
}

export const KeywordTemplate: React.FC<KeywordTemplateProps> = ({
  id: keywordId,
  tab,
  onTabChange,
  onKeywordClick,
  onEventClick,
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
            <SEO title={"keywords"} urlPath={`keywords/${keyword.tag}`} />
            <SplitPageTemplate
              tab={tab}
              onTabChange={onTabChange}
              name={`#${keyword.tag}`}
              tabs={[
                { label: "Events" },
                { label: "Hierarchy" },
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
              <Box style={{ height: 600 }}>
                <EventNetworkGraphBox
                  type={KEYWORDS.value}
                  id={keyword.id}
                  query={{
                    groupBy: KEYWORDS.value,
                  }}
                  onKeywordClick={onKeywordClick}
                  onEventClick={onEventClick}
                />
              </Box>
            </SplitPageTemplate>
          </Box>
        );
      }}
    />
  );
};
