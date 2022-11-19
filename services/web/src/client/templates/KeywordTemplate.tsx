import { EventType } from "@liexp/shared/io/http/Events";
import { KeywordPageContent } from "@liexp/ui/components/KeywordPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box } from "@liexp/ui/components/mui";
import { useKeywordQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import * as React from "react";
import { EventsPanel } from "../containers/EventsPanel";
import { queryToHash, useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordTemplate: React.FC<{ keywordId: string }> = ({ keywordId }) => {
  const navigateToResource = useNavigateToResource();
  const { tab = 0 } = useRouteQuery<{ tab?: string }>();

  return (
    <QueriesRenderer
      queries={{ keyword: useKeywordQuery({ id: keywordId }) }}
      render={({ keyword }) => {
        return (
          <Box display="flex" flexDirection="column" height="100%">
            <SEO title={"keywords"} urlPath={`keywords/${keyword.tag}`} />
            <KeywordPageContent
              keyword={keyword}
              hierarchicalGraph={{
                onNodeClick(n) {
                  navigateToResource.events(
                    {},
                    {
                      hash: queryToHash({
                        keywords: [n.data.id],
                      }),
                    }
                  );
                },
                onLinkClick: ([firstK, secondK]) => {
                  navigateToResource.events(
                    {},
                    {
                      hash: queryToHash({
                        keywords: [firstK.data.id, secondK.data.id],
                      }),
                    }
                  );
                },
              }}
            />

            <EventsPanel
              tab={typeof tab === "string" ? parseInt(tab, 10) : (tab as any)}
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
              onQueryChange={(q, tab) => {
                navigateToResource.actors({ id: keyword.id }, { tab });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default KeywordTemplate;
