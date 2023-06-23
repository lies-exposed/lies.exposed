import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import EventCard from "../components/Cards/Events/EventCard";
import QueriesRenderer from "../components/QueriesRenderer";
import { Grid, Typography } from "../components/mui";
import {
  type SearchEventQueryInput,
  searchEventsQuery,
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
        const gridSize =
          12 / (events.events.length < 3 ? events.events.length : 3);
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

            {events.events.map((e) => (
              <Grid
                key={e.id}
                item
                sm={gridSize}
                xs={12}
                style={{ height: "100%" }}
              >
                <EventCard
                  event={e}
                  showRelations={true}
                  style={{ height: "100%" }}
                  onEventClick={onEventClick}
                />
              </Grid>
            ))}
          </Grid>
        );
      }}
    />
  );
};

export default EventsBox;
