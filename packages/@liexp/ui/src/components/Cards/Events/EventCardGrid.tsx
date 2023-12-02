import { type Events } from "@liexp/shared/lib/io/http";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import React from "react";
import { styled } from "../../../theme";
import { Grid } from "../../mui";
import EventCard from "./EventCard";

interface EventCardGridProps {
  events: Events.SearchEvent.SearchEvent[];
  onItemClick: (e: Events.SearchEvent.SearchEvent) => void;
}

const PREFIX = "EventCardGrid";
const classes = {
  cardContainer: `${PREFIX}-grid`,
  card: `${PREFIX}-card`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.cardContainer}`]: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    height: "100%",
    [`${theme.breakpoints.down("sm")}`]: {
      height: "auto",
    },
  },
  [`& .${classes.card}`]: {
    height: "100%",
    width: "100%",
    [`${theme.breakpoints.down("sm")}`]: {
      height: "auto",
    },
  },
}));

export const EventCardGrid: React.FC<EventCardGridProps> = ({
  events,
  ...props
}) => {
  const gridSize = 12 / (events.length < 3 ? events.length : 3);

  return (
    <StyledGrid container spacing={2}>
      {pipe(
        events,
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
                <Grid
                  key={e.id}
                  item
                  className={classes.cardContainer}
                  md={gridSize}
                  sm={6}
                  xs={12}
                >
                  <EventCard
                    event={e}
                    showRelations={true}
                    className={classes.card}
                    onEventClick={props.onItemClick}
                  />
                </Grid>
              ))}
            </Grid>
          );
        }),
      )}
    </StyledGrid>
  );
};
