import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import {
  eventsDataToNavigatorItems,
  ordEventDate,
} from "@econnessione/shared/helpers/event";
import { ContentWithSideNavigation } from "@econnessione/ui/components/ContentWithSideNavigation";
import { KeywordPageContent } from "@econnessione/ui/components/KeywordPageContent";
import { Layout } from "@econnessione/ui/components/Layout";
import SEO from "@econnessione/ui/components/SEO";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { useQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

const TopicTimelineTemplate: React.FunctionComponent<{ keywordId: string }> = ({
  keywordId,
}) => {
  const queries = useQueries(
    { keyword: Queries.Keyword.get, events: Queries.Event.getList },
    {
      keyword: { id: keywordId },
      events: {
        filter: {
          keywords: [keywordId],
        },
        pagination: { page: 1, perPage: 20 },
        sort: {
          field: "startDate",
          order: "DESC",
        },
      },
    }
  );
  return pipe(
    queries,
    QR.fold(
      LazyFullSizeLoader,
      ErrorBox,
      ({ keyword, events: { data: events } }) => {
        return (
          <Layout>
            <SEO title={"keywords"} />
            <ContentWithSideNavigation
              items={eventsDataToNavigatorItems(events)}
            >
              <KeywordPageContent {...keyword} />
              <EventList
                events={A.sort(Ord.getDualOrd(ordEventDate))(events)}
                actors={[]}
                groups={[]}
                keywords={[]}
              />
            </ContentWithSideNavigation>
          </Layout>
        );
      }
    )
  );
};

export default TopicTimelineTemplate;
