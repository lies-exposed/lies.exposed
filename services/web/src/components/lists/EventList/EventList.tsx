import { Actor, Events, Group } from "@econnessione/shared/lib/io/http";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as React from "react";
import { UncategorizedListItem } from "./UncategorizedListItem";

export interface EventListProps {
  events: Events.Event[];
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events" style={{ width: "100%" }}>
      {pipe(
        props.events,
        A.map((event) => {
          // eslint-disable-next-line
          console.log(
            PathReporter.report(
              Events.Uncategorized.Uncategorized.decode(event),
            ),
            Events.Uncategorized.Uncategorized.is(event)
          );
          if (Events.Uncategorized.Uncategorized.is(event)) {
            return (
              <UncategorizedListItem
                key={event.id}
                item={event}
                actors={[]}
                groups={[]}
                topics={[]}
              />
            );
          }
          return "Not implemented";
        })
      )}
    </div>
  );
};

export default EventList;
