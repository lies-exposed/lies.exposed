import EventCard from "@liexp/ui/components/Cards/Events/EventCard";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import {
    searchEventsQuery
} from "@liexp/ui/state/queries/SearchEventsQuery";
import {
    Grid, useTheme
} from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

interface EventsBoxProps {
  query: any;
}

const EventsBox: React.FC<EventsBoxProps> = (props) => {
  const theme = useTheme();


  return (
    <WithQueries
      queries={{
        events: searchEventsQuery,
      }}
      params={{
        events: {
            ...props.query,
          _start: 0,
          _end: 10,
        } as any,
      }}
      render={QR.fold(
        () => (
          <Loader />
        ),
        ErrorBox,
        ({ events }) => {

          return (
            <Grid container spacing={2}>
              {events.events.map((e) => {
                return (
                  <Grid key={e.id} item md={4}>
                    <EventCard event={e} showRelations={false} />
                  </Grid>
                );
              })}
            </Grid>
          );
        }
      )}
    />
  );
};

export default EventsBox;
