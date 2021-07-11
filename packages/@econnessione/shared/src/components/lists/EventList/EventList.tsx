import { Actor, Events, Group } from "@io/http";
import { Grid } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { UncategorizedListItem } from "./UncategorizedListItem";

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
                if (Events.Uncategorized.Uncategorized.is(e)) {
                  return (
                    <Grid key={e.id} item md={6}>
                      <UncategorizedListItem
                        key={e.id}
                        item={e}
                        actors={props.actors}
                        groups={props.groups}
                        topics={[]}
                      />
                    </Grid>
                  );
                }
                return "Not implemented";
              })}
            </Grid>
          );
        })
      )}
    </div>
  );
};

export default EventList;
