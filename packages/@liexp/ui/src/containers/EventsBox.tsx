import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import {
  EventCardGrid,
  type EventCardGridProps,
} from "../components/Cards/Events/EventCardGrid.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Grid, Typography } from "../components/mui/index.js";
import { type SearchEventQueryInput } from "../state/queries/SearchEventsQuery.js";
import { useTheme } from "../theme/index.js";

export interface EventsBoxProps<
  E extends SearchEvent.SearchEvent = SearchEvent.SearchEvent,
> extends Omit<EventCardGridProps<E>, "events"> {
  title?: string;
  query: Partial<SearchEventQueryInput>;
  hideIfEmpty?: boolean;
}

const EventsBox = <E extends SearchEvent.SearchEvent>({
  query,
  title,
  hideIfEmpty = false,
  ...eventCardGridProps
}: EventsBoxProps<E>): React.JSX.Element => {
  const theme = useTheme();

  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.Custom.SearchEvents.useQuery(undefined, {
          ...query,
          _start: query._start?.toString() ?? "0",
          _end: query._end?.toString() ?? "10",
        }),
      })}
      render={({
        events: {
          data: { events },
        },
      }) => {
        if (hideIfEmpty && events.length === 0) {
          return <div />;
        }

        return (
          <Grid
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
              <Grid size={12}>
                <Typography variant="h5">{title}</Typography>
              </Grid>
            ) : null}

            <Grid size={12}>
              <EventCardGrid events={events as E[]} {...eventCardGridProps} />
            </Grid>
          </Grid>
        );
      }}
    />
  );
};

export default EventsBox;
