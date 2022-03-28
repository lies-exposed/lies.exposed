import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { Box, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import EventsBox from "../components/events/EventsBox";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigateTo = useNavigateToResource();

  return (
    <WithQueries
      queries={{
        event: Queries.Event.get,
        media: Queries.Media.getList,
      }}
      params={{
        event: { id: eventId },
        media: {
          pagination: { page: 1, perPage: 10 },
          filter: { events: [eventId] },
          sort: { field: "updatedAt", order: "DESC" },
        },
      }}
      render={QR.fold(Loader, ErrorBox, ({ event, media }) => {
        return (
          <Box style={{ margin: 20, marginBottom: 100 }}>
            <EventPageContent
              event={event as any}
              media={media.data}
              onGroupClick={(g) => {
                navigateTo.groups({ id: g.id });
              }}
              onKeywordClick={(k) => {
                navigateTo.keywords({ id: k.id });
              }}
              onActorClick={(a) => {
                navigateTo.actors({ id: a.id });
              }}
              onGroupMemberClick={(g) => {
                navigateTo.actors({ id: g.actor.id });
              }}
              onLinkClick={() => {}}
            />
            <Box>
              <Typography>More events by keyword</Typography>
              <EventsBox query={{ keywords: event.keywords }} />
            </Box>
          </Box>
        );
      })}
    />
  );
};

export default EventTemplate;
