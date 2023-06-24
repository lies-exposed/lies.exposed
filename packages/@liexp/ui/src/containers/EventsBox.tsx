import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import { EventCardGrid } from "../components/Cards/Events/EventCardGrid";
import QueriesRenderer from "../components/QueriesRenderer";
import { Grid, Typography } from "../components/mui";
import {
  searchEventsQuery,
  type SearchEventQueryInput,
} from "../state/queries/SearchEventsQuery";
import { useTheme } from "../theme";

export interface EventsBoxProps {
  title: string;
  query: Partial<SearchEventQueryInput>;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

const EventsBox: React.FC<EventsBoxProps> = ({
  query,
  title,
  onEventClick,
}) => {
  const theme = useTheme();
  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          hash: `${title.trim()}`,
          _start: 0,
          _end: 10,
          ...query,
        }),
      }}
      render={({ events }) => {

        return (
          <Grid
            container
            spacing={2}
            style={{ marginBottom: theme.spacing(2) }}
          >
            {events.events.length > 0 ? (
              <Grid item xs={12}>
                <Typography variant="h5">{title}</Typography>
              </Grid>
            ) : null}

            <EventCardGrid events={events.events} onItemClick={onEventClick} />
          </Grid>
        );
      }}
    />
  );
};

export default EventsBox;
