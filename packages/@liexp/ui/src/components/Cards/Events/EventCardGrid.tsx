import { Events } from "@liexp/shared/io/http";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import React from "react";
import { Grid } from "../../mui";
import EventCard from "./EventCard";

interface EventCardGridProps {
  events: Events.SearchEvent.SearchEvent[];
  onItemClick: (e: Events.SearchEvent.SearchEvent) => void;
}

export const EventCardGrid: React.FC<EventCardGridProps> = (props) => {
  return (
    <Grid container spacing={2}>
      {pipe(
        props.events,
        A.chunksOf(3),
        A.map((ev) => {
          return (
            <Grid
              item
              container
              spacing={2}
              key={`events-chunk-container${ev[0].id}`}
            >
              {ev.map((e) => (
                <Grid key={e.id} item sm={4} xs={12} style={{ height: "100%" }}>
                  <EventCard
                    event={e}
                    showRelations={true}
                    style={{ height: "100%" }}
                    onEventClick={props.onItemClick}
                  />
                </Grid>
              ))}
            </Grid>
          );
        })
      )}
    </Grid>
  );
};
