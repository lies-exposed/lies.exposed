import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import {
  EventCardGrid,
  type EventCardGridProps,
} from "../components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Grid2, Typography } from "../components/mui/index.js";
import { useAPI } from "../hooks/useAPI.js";
import {
  searchEventsQuery,
  type SearchEventQueryInput,
} from "../state/queries/SearchEventsQuery.js";
import { useTheme } from "../theme/index.js";

export interface EventsBoxProps<
  E extends SearchEvent.SearchEvent = SearchEvent.SearchEvent,
> extends Omit<EventCardGridProps<E>, "events"> {
  title?: string;
  query: Partial<SearchEventQueryInput>;
}

const EventsBox = <E extends SearchEvent.SearchEvent>({
  query,
  title,
  ...eventCardGridProps
}: EventsBoxProps<E>): React.JSX.Element => {
  const theme = useTheme();
  const api = useAPI();

  const searchEventsFn = searchEventsQuery(api)({
    hash: title ? title.trim() : JSON.stringify(query),
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
          <Grid2
            display="flex"
            container
            direction={"column"}
            spacing={2}
            style={{
              marginBottom: theme.spacing(2),
              width: "100%",
            }}
          >
            {title ? (
              <Grid2 size={12}>
                <Typography variant="h5">{title}</Typography>
              </Grid2>
            ) : null}

            <EventCardGrid
              events={events.events as E[]}
              {...eventCardGridProps}
            />
          </Grid2>
        );
      }}
    />
  );
};

export default EventsBox;
