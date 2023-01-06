import { Keyword } from "@liexp/shared/io/http";
import { EventType } from "@liexp/shared/io/http/Events";
import { SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import ParentSize from "@visx/responsive/lib/components/ParentSizeModern";
import * as React from "react";
import { KeywordHierarchyEdgeBundlingGraph } from "../components/Graph/KeywordHierarchyEdgeBundlingGraph";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import { Box, Typography } from "../components/mui";
import { EventsPanel } from "../containers/EventsPanel";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { useKeywordQuery } from "../state/queries/DiscreteQueries";
import { SplitPageTemplate } from "./SplitPageTemplate";

export interface KeywordTemplateProps {
  id: string;
  tab: number;
  onTabChange: (t: number) => void;
  onEventClick: (e: SearchEvent) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
}

export const KeywordTemplate: React.FC<KeywordTemplateProps> = ({
  id: keywordId,
  tab,
  onTabChange,
  onKeywordClick,
  onEventClick,
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
              sidebar={({ className }) => (
                <Box className={className}>
                  <Typography
                    variant="h4"
                    color={keyword.color as any}
                    style={{
                      color: `#${keyword.color}`,
                    }}
                  >
                    #{keyword.tag}
                  </Typography>
                </Box>
              )}
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
              <EventsPanel
                tab={tab}
                slide={false}
                query={{
                  hash: `keyword-${keywordId}`,
                  keywords: [keyword.id],
                  startDate: undefined,
                  endDate: new Date().toDateString(),
                  actors: [],
                  groups: [],
                  groupsMembers: [],
                  media: [],
                  locations: [],
                  type: EventType.types.map((t) => t.value),
                  _sort: "date",
                  _order: "DESC",
                }}
                keywords={[keyword]}
                actors={[]}
                groups={[]}
                groupsMembers={[]}
                onQueryChange={(q, tab) => {}}
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
