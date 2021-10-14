import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  return (
    <WithQueries
      queries={{
        event: Queries.Event.get,
        actors: Queries.Actor.getList,
        groups: Queries.Group.getList,
        links: Queries.Link.getList,
        keywords: Queries.Keyword.getList,
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
        keywords: {
          pagination: { perPage: 20, page: 1 },
          sort: { order: "DESC", field: "tag" },
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
          keywords: { data: keywords },
        }) => (
          <EventPageContent
            event={event as any}
            actors={actors}
            groups={groups}
            links={links}
            keywords={keywords}
          />
        )
      )}
    />
  );
};

export default EventTemplate;
