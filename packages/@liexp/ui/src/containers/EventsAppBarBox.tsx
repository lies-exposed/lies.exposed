import { parseISO } from "date-fns";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import EventsAppBar, {
  type EventsAppBarProps,
} from "../components/events/filters/EventsAppBar.js";

interface EventsAppBarBoxProps
  extends Omit<EventsAppBarProps, "events" | "totals"> {
  hash: string;
}

const EventsAppBarBox: React.FC<EventsAppBarBoxProps> = ({
  query,
  hash: _hash,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        searchEvents: Q.Event.Custom.SearchEvents.useQuery(undefined, {
          ...query,
          _start: "0",
          _end: "0",
        }),
      })}
      render={({
        searchEvents: {
          data: {
            totals,
            firstDate = new Date().toISOString(),
            lastDate = new Date().toISOString(),
            events,
          },
        },
      }) => {
        return (
          <EventsAppBar
            {...props}
            query={query}
            events={events}
            totals={totals}
            dateRange={
              props.dateRange ?? [parseISO(firstDate), parseISO(lastDate)]
            }
          />
        );
      }}
    />
  );
};
export default EventsAppBarBox;
