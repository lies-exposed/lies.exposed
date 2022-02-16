import { formatDate } from "@econnessione/shared/utils/date";
import { Box, Grid, Link, makeStyles, Typography } from "@material-ui/core";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from "@material-ui/lab";
import * as React from "react";
import { isValidValue } from '../../Common/Editor';
import { EventIcon } from "../../Common/Icons/EventIcon";
import { EventListItem, EventListItemProps, SearchEvent } from "./EventListItem";
import { TimelineEventSubjects } from "./TimelineEventSubjects";

export interface EventTimelineItemProps extends EventListItemProps {
  isLast: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
  },
  wrapper: {
    display: "flex",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  oppositeContent: {
    flex: 0,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10
    },
  },
  separator: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  content: {
    paddingBottom: 20,
  },
}));

export const getItemHeight = (e: SearchEvent): number => {
  switch (e.type) {
    default: {
      return (
        100 +
        (isValidValue(e.excerpt as any) ? 100 : 0) +
        (e.keywords.length > 0 ? 50 : 0) +
        (e.media.length > 0 ? 400 : 0) +
        (e.links.length > 0 ? 50 : 0)
      );
    }
  }
};

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event: e,
  isLast,
  ...props
}) => {
  const classes = useStyles();

  return (
    <div
      key={`event-list-item-${e.id}`}
      className={classes.root}
      style={{
        overflow: "hidden",
        ...props.style,
      }}
    >
      <Grid
        container
        justifyContent="center"
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
        }}
      >
        <Grid
          item
          md={12}
          lg={8}
          style={{
            flexGrow: 1,
            display: "flex",
            height: "100%",
            width: "100%",
          }}
        >
          <TimelineItem className={classes.wrapper} style={{ width: "100%" }}>
            <TimelineOppositeContent className={classes.oppositeContent}>
              <Typography variant="subtitle1" color="primary">
                {formatDate(e.date)}
              </Typography>
              <TimelineEventSubjects event={e} {...props} />

              <Box
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  flexGrow: 1,
                }}
              >
                <Link
                  href={`${process.env.ADMIN_URL}/index.html?#events/${e.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Edit
                </Link>
              </Box>
            </TimelineOppositeContent>
            <TimelineSeparator className={classes.separator}>
              <TimelineDot variant="outlined" color="inherit">
                <EventIcon type={e.type} />
              </TimelineDot>
              {!isLast ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent className={classes.content}>
              <EventListItem event={e} {...props} />
            </TimelineContent>
          </TimelineItem>
        </Grid>
      </Grid>
    </div>
  );
};

export default EventTimelineItem;
