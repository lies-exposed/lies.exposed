import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { EventPageContent } from "@econnessione/shared/components/EventPageContent";
import EventsMap from "@econnessione/shared/components/EventsMap";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { ProjectPageContent } from "@econnessione/shared/components/ProjectPageContent";
import SEO from "@econnessione/shared/components/SEO";
import { eventMetadataMapEmpty } from "@econnessione/shared/mock-data/events/events-metadata";
import {
  actorsList,
  event,
  groupsList,
  project,
} from "@econnessione/shared/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class EventTemplate extends React.PureComponent<
  RouteComponentProps<{ eventId: string }>
> {
  render(): JSX.Element {
    // eslint-disable-next-line
    console.log(this.props);

    return pipe(
      O.fromNullable(this.props.eventId),
      O.fold(
        () => <div>Missing event id</div>,
        (eventId) => (
          <WithQueries
            queries={{ event: event, actors: actorsList, groups: groupsList }}
            params={{
              event: { id: eventId },
              actors: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {},
              },
              groups: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {},
              },
            }}
            render={QR.fold(
              Loader,
              ErrorBox,
              ({
                event,
                actors: { data: actors },
                groups: { data: groups },
              }) => (
                <MainContent>
                  <SEO title={event.title} />
                  <EventPageContent
                    event={event as any}
                    actors={actors}
                    groups={groups}
                  />
                </MainContent>
              )
            )}
          />
        )
      )
    );
  }
}
