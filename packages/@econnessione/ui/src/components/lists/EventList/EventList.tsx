import { Actor, Events, Group } from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  ...props
}) => {
  if (Events.Uncategorized.Uncategorized.is(e)) {
    return (
      <UncategorizedListItem
        key={e.id}
        item={e}
        actors={props.actors}
        groups={props.groups}
        topics={[]}
      />
    );
  }
  return <span>Not implemented</span>;
};

export interface EventListProps {
  events: Events.Event[];
  actors: Actor.Actor[];
  groups: Group.Group[];
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events" style={{ width: "100%" }}>
      {pipe(
        props.events,
        A.chunksOf(2),
        A.map((event) => {
          return (
            <Grid key={`container-${event[0].id}`} container spacing={2}>
              {event.map((e) => {
                const actors = Events.Uncategorized.Uncategorized.is(e)
                  ? props.actors.filter((a) => e.actors.includes(a.id))
                  : [];
                const groups = Events.Uncategorized.Uncategorized.is(e)
                  ? props.groups.filter((a) => e.groups.includes(a.id))
                  : [];
                return (
                  <Grid key={e.id} item md={6}>
                    <EventListItem event={e} actors={actors} groups={groups} />
                  </Grid>
                );
              })}
            </Grid>
          );
        })
      )}
    </div>
  );
};

export default EventList;
