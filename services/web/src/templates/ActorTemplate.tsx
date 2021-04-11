import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ActorPageContent } from "@econnessione/shared/components/ActorPageContent";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import { EventSlider } from "@econnessione/shared/components/sliders/EventSlider";
import { eventMetadataMapEmpty } from "@econnessione/shared/mock-data/events/events-metadata";
import { actor } from "@econnessione/shared/providers/DataProvider";
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
            params={{
              actor: { id: actorId },
            }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ actor }) => {
              return (
                <MainContent>
                  <SEO title={actor.fullName} />
                  <ActorPageContent
                    {...actor}
                    metadata={eventMetadataMapEmpty}
                  />
                  <div style={{ padding: 50 }}>
                    <EventSlider filter={{ actors: O.some([actorId]) }} />
                  </div>
                </MainContent>
              );
            })}
          />
        )
      )
    );
  }
}
