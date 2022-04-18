import { KeywordPageContent } from "@liexp/ui/components/KeywordPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import EventsTimeline from "@liexp/ui/src/components/lists/EventList/EventsTimeline";
import { useKeywordQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Box } from "@material-ui/core";
import * as React from "react";
import { useParams } from "react-router-dom";

const KeywordTemplate: React.FC = () => {
  const { keywordId } = useParams();
  return (
    <QueriesRenderer
      queries={{ keyword: useKeywordQuery({ id: keywordId }) }}
      render={({ keyword: { data: keyword } }) => {
        return (
          <Box display="flex" flexDirection="column" height="100%">
            <SEO title={"keywords"} urlPath={`keywords/${keyword.tag}`} />
            <KeywordPageContent {...keyword} />
            <EventsTimeline
              hash={`keyword-${keywordId}`}
              queryParams={{
                keywords: [keyword.id],
              }}
              onClick={() => {}}
              onActorClick={() => {}}
              onGroupClick={() => {}}
              onGroupMemberClick={() => {}}
              onKeywordClick={() => {}}
            />
          </Box>
        );
      }}
    />
  );
};

export default KeywordTemplate;
