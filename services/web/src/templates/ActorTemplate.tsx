import { ActorPageContent } from "@components/ActorPageContent";
import { ErrorBox } from "@components/Common/ErrorBox";
// import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { Loader } from "@components/Common/Loader";
import { Layout } from "@components/Layout";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import { EventSlider } from "@components/sliders/EventSlider";
import { eventMetadataMapEmpty } from "@mock-data/events/events-metadata";
import { actor } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class ActorTemplate extends React.PureComponent<
  RouteComponentProps<{
    actorId: string;
  }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.actorId),
      O.fold(
        () => <div>Missing project id</div>,
        (actorId) => (
          <WithQueries
            queries={{ actor: actor }}
            params={{ actor: { id: actorId } }}
            render={QR.fold(Loader, ErrorBox, ({ actor }) => {
              return (
                <MainContent>
                  <SEO title={actor.fullName} />
                  <ActorPageContent
                    {...actor}
                    metadata={eventMetadataMapEmpty}
                  />
                  <EventSlider events={[]} />
                  {/* <EventsNetwork
                events={events.filter(UncategorizedMD.is)}
                selectedActorIds={[pageContent.frontmatter.id]}
                selectedGroupIds={[]}
                selectedTopicIds={[]}
                scale="all"
                scalePoint={O.none}
              /> */}
                </MainContent>
              );
            })}
          />
        )
      )
    );
  }
}
