import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer";
import EventsAppBar, {
  type EventsAppBarProps
} from "../components/events/filters/EventsAppBar";
import { searchEventsQuery } from "../state/queries/SearchEventsQuery";

interface EventsAppBarBoxProps extends Omit<EventsAppBarProps, 'events' | 'totals'> {
  hash: string;
}

const EventsAppBarBox: React.FC<EventsAppBarBoxProps> = ({
  query,
  hash: _hash,
  ...props
}) => {
  const hash = `${_hash}-totals`;

  return (
    <QueriesRenderer
      queries={{
        searchEvents: searchEventsQuery({
          ...query,
          hash,
          _start: 0,
          _end: 0,
        }),
      }}
      render={({ searchEvents: { totals, events } }) => {
        return <EventsAppBar {...props} query={query} events={events} totals={totals} />;
      }}
    />
  );
};
export default EventsAppBarBox;
