import { ActorPageContent } from "@components/ActorPageContent";
// import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { Layout } from "@components/Layout";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import { EventSlider } from "@components/sliders/EventSlider";
import { Actor, Events } from "@econnessione/shared/lib/io/http";
import { eventsInDateRange } from "@helpers/event";
import { eventMetadataMapEmpty } from "@mock-data/events/events-metadata";
// import { UncategorizedMD } from "@econnessione/shared/lib/io/httpevents/Uncategorized"
import { throwValidationErrors } from "@utils/throwValidationErrors";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import React from "react";

interface ActorTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: Actor.ActorMD };
    events: {
      nodes: Events.EventMD[];
    };
  };
}

const ActorTemplate: React.FC<ActorTemplatePageProps> = ({ data }) => {
  const minDate = O.none;
  const maxDate = O.none;

  return pipe(
    sequenceS(E.either)({
      pageContent: Actor.ActorMD.decode(data.pageContent.childMdx),
      events: pipe(
        t.array(Events.Event).decode(data.events.nodes),
        E.map(eventsInDateRange({ minDate, maxDate }))
      ),
    }),

    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.fullName} />
          <MainContent>
            <ActorPageContent
              {...pageContent}
              metadata={eventMetadataMapEmpty}
            />
            <EventSlider events={events} />
            {/* <EventsNetwork
              events={events.filter(UncategorizedMD.is)}
              selectedActorIds={[pageContent.frontmatter.id]}
              selectedGroupIds={[]}
              selectedTopicIds={[]}
              scale="all"
              scalePoint={O.none}
            /> */}
          </MainContent>
        </Layout>
      );
    })
  );
};

// export const pageQuery = graphql`
//   query ActorTemplatePage($actorUUID: String!) {
//     pageContent: file(
//       sourceInstanceName: { eq: "actors" }
//       name: { eq: $actorUUID }
//     ) {
//       childMdx {
//         ...ActorMD
//       }
//     }

//     events: allMdx(filter: { fields: { actors: { in: [$actorUUID] } } }) {
//       nodes {
//         ...EventMD
//       }
//     }
//   }
// `

export default ActorTemplate;
