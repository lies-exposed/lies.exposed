import { SearchEvent } from "@liexp/shared/io/http/Events";
import * as React from "react";
import {
  SearchEventQueryInput,
  searchEventsQuery,
} from "../../state/queries/SearchEventsQuery";
import { useTheme } from "../../theme";
import EventCard from "../Cards/Events/EventCard";
import { Grid, Typography } from "../mui";
import QueriesRenderer from "../QueriesRenderer";
import * as A from "fp-ts/lib/Array";

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
            {A.chunksOf(3)(events.events).map((ev) => {
              return (
                <Grid item container spacing={2}>
                  {ev.map((e) => (
                    <Grid
                      key={e.id}
                      item
                      sm={4}
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
            })}
          </Grid>
        );
      }}
    />
  );
};

export default EventsBox;
