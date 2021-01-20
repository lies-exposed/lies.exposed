import { AreaPageContent } from "@components/AreaPageContent";
import { Layout } from "@components/Layout";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import EventList from "@components/lists/EventList/EventList";
import { Area, Events } from "@econnessione/shared/lib/io/http";
import { throwValidationErrors } from "@utils/throwValidationErrors";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
// import { navigate } from "gatsby"
import * as t from "io-ts";
import React from "react";

interface GroupTemplatePageProps {
  // navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: unknown };
    events: { nodes: unknown[] };
  };
}

const AreaTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    sequenceS(E.either)({
      area: Area.AreaMD.decode(data.pageContent.childMdx),
      events: t.array(Events.Event).decode(data.events.nodes),
    }),
    E.fold(throwValidationErrors, ({ area, events }) => {
      return (
        <Layout>
          <SEO title={area.frontmatter.label} />
          {/* <FlexGridItem>
            <CalendarHeatmap
              width={1000}
              height={300}
              events={events}
              onCircleClick={async event => {
                await navigate(`#${event.id}`)
              }}
            />
            </FlexGridItem> */}
          <MainContent>
            <AreaPageContent
              {...area}
              onGroupClick={() => {}}
              onTopicClick={() => {}}
            />
            <EventList events={events} />
          </MainContent>
        </Layout>
      );
    })
  );
};

// export const pageQuery = graphql`
//   query AreaTemplateQuery(
//     $areaUUID: String!
//     $groupUUIDs: [String!]
//     $topicUUIDs: [String!]
//   ) {
//     pageContent: file(
//       name: { eq: $areaUUID }
//       sourceInstanceName: { eq: "areas" }
//     ) {
//       childMdx {
//         ...AreaMD
//       }
//     }
//     events: allMdx(
//       filter: {
//         fields: {
//           collection: { eq: "events" }
//           groups: { in: $groupUUIDs }
//           topics: { in: $topicUUIDs }
//         }
//       }
//     ) {
//       nodes {
//         ...EventMD
//       }
//     }
//   }
// `

export default AreaTemplate;
