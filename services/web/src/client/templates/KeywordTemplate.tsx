import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { ContentWithSideNavigation } from "@liexp/ui/components/ContentWithSideNavigation";
import { KeywordPageContent } from "@liexp/ui/components/KeywordPageContent";
import SEO from "@liexp/ui/components/SEO";
import { Queries } from "@liexp/ui/providers/DataProvider";
import EventsTimeline from "@liexp/ui/src/components/lists/EventList/EventsTimeline";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Box } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { useQueries } from "avenger/lib/react";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

const KeywordTemplate: React.FunctionComponent<{ keywordId: string }> = ({
  keywordId,
}) => {
  const queries = useQueries(
    {
      keyword: Queries.Keyword.get,
      // searchEvents: searchEventsQuery
    },
    {
      keyword: { id: keywordId },
      // searchEvents: {
      //   keywords: [keywordId],
      //   _start: 0,
      //   _end: 100,
      //   hash: `keyword-${keywordId}`,
      // },
    }
  );
  return pipe(
    queries,
    QR.fold(LazyFullSizeLoader, ErrorBox, ({ keyword }) => {
      return (
        <Box display="flex" flexDirection="column" height="100%">
          <SEO
            title={"keywords"}
            image={`${process.env.PUBLIC_URL}liexp-logo.png`}
          />
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
    })
  );
};

export default KeywordTemplate;
