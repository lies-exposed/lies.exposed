import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import { EventCardGrid } from "../components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Grid, Typography } from "../components/mui/index.js";
import { useAPI } from "../hooks/useAPI.js";
import {
  searchEventsQuery,
  type SearchEventQueryInput,
} from "../state/queries/SearchEventsQuery.js";
import { useTheme } from "../theme/index.js";

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
  const api = useAPI();

  const searchEventsFn = searchEventsQuery(api)({
    hash: `${title.trim()}`,
    _start: 0,
    _end: 10,
    ...query,
  });

  return (
    <QueriesRenderer
      queries={{
        events: searchEventsFn,
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
