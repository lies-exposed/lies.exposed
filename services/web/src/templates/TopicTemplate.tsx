import {
  eventsDataToNavigatorItems,
  ordEventDate,
} from "@econnessione/shared/helpers/event";
import { Events, Topic } from "@econnessione/shared/io/http";
import { throwValidationErrors } from "@econnessione/shared/utils/throwValidationErrors";
import { ContentWithSideNavigation } from "@econnessione/ui/components/ContentWithSideNavigation";
import { Layout } from "@econnessione/ui/components/Layout";
import SEO from "@econnessione/ui/components/SEO";
import { TopicPageContent } from "@econnessione/ui/components/TopicPageContent";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import * as React from "react";

interface TopicTimelineTemplateProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: Topic.TopicMD };
    events: {
      nodes: Events.EventMD[];
    };
  };
}

const TopicTimelineTemplate: React.FunctionComponent<TopicTimelineTemplateProps> =
  ({ data }) => {
    return pipe(
      sequenceS(E.either)({
        events: t
          .array(Events.Uncategorized.Uncategorized)
          .decode(data.events.nodes),
        pageContent: Topic.TopicMD.decode(data.pageContent.childMdx),
      }),
      E.fold(throwValidationErrors, ({ pageContent, events }) => {
        return (
          <Layout>
            <SEO title={pageContent.frontmatter.label} />
            <ContentWithSideNavigation
              items={eventsDataToNavigatorItems(events)}
            >
              <TopicPageContent {...pageContent} />
              <EventList
                events={A.sort(Ord.getDualOrd(ordEventDate))(events)}
                actors={[]}
                groups={[]}
              />
            </ContentWithSideNavigation>
          </Layout>
        );
      })
    );
  };

// export const pageQuery = graphql`
//   query TopicTemplateQuery($topic: String!) {
//     pageContent: file(
//       sourceInstanceName: { eq: "topics" }
//       name: { eq: $topic }
//     ) {
//       childMdx {
//         ...TopicMD
//       }
//     }

//     events: allMdx(
//       filter: {
//         fields: { collection: { eq: "events" }, topics: { in: [$topic] } }
//       }
//     ) {
//       nodes {
//         ...EventMD
//       }
//     }
//   }
// `

export default TopicTimelineTemplate;
