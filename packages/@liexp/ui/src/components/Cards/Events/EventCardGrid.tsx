import { type Events } from "@liexp/shared/lib/io/http/index.js";
import * as A from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { styled } from "../../../theme/index.js";
import { Grid } from "../../mui/index.js";
import EventCard from "./EventCard.js";

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
    [theme.breakpoints.down("md")]: {
      height: "auto",
    },
  },
  [`& .${classes.card}`]: {
    height: "100%",
    width: "100%",
    [`${theme.breakpoints.down("md")}`]: {
      height: "auto",
    },
  },
}));

export const EventCardGrid: React.FC<EventCardGridProps> = ({
  events,
  ...props
}) => {
  const gridSize = 12 / (events.length < 3 ? events.length : 3);
  const conf = useConfiguration();
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
                    defaultImage={conf.platforms.web.defaultImage}
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
