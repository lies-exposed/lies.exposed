import EventCard from "@liexp/ui/components/Cards/Events/EventCard";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Grid, Typography, useTheme } from "@mui/material";
import * as React from "react";
import { useNavigateToResource } from "../../utils/location.utils";

interface EventsBoxProps {
  title: string;
  query: any;
}

const EventsBox: React.FC<EventsBoxProps> = (props) => {
  const theme = useTheme();
  const navigateToResource = useNavigateToResource();
  return (
    <QueriesRenderer
      queries={{
        events: searchEventsQuery({
          _start: 0,
          _end: 10,
          ...props.query,
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
                <Typography variant="h5">{props.title}</Typography>
              </Grid>
            ) : null}
            {events.events.map((e) => {
              return (
                <Grid key={e.id} item sm={4} xs={12}>
                  <EventCard
                    event={e}
                    showRelations={true}
                    onEventClick={(e) =>
                      navigateToResource.events({ id: e.id })
                    }
                  />
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
