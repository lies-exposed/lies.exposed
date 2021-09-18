import { Queries } from "@econnessione/shared/providers/DataProvider";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export default class EventTemplate extends React.PureComponent<
  RouteComponentProps<{ eventId: string }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.eventId),
      O.fold(
        () => <div>Missing event id</div>,
        (eventId) => (
          <WithQueries
            queries={{
              event: Queries.Event.get,
              actors: Queries.Actor.getList,
              groups: Queries.Group.getList,
              links: Queries.Link.getList,
            }}
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
              links: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {
                  events: [eventId],
                },
              },
            }}
            render={QR.fold(
              Loader,
              ErrorBox,
              ({
                event,
                actors: { data: actors },
                groups: { data: groups },
                links: { data: links },
              }) => (
                <EventPageContent
                  event={event as any}
                  actors={actors}
                  groups={groups}
                  links={links}
                />
              )
            )}
          />
        )
      )
    );
  }
}
