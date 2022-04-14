import { formatDate } from "@liexp/shared/utils/date";
import { Box, Grid, Link, makeStyles, Typography } from "@material-ui/core";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@material-ui/lab";
import * as React from "react";
import { EventIcon } from "../../Common/Icons/EventIcon";
import { EventListItem, EventListItemProps } from "./EventListItem";
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
    flexGrow: 0,
    flexShrink: 1,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
      width: "100%",
    },
  },
  editButtonBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    flexGrow: 1,
    [theme.breakpoints.down("md")]: {
      flexGrow: 0,
    },
  },
  separator: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  dot: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    paddingBottom: 20,
  },
}));

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event: e,
  isLast,
  style,
  onKeywordClick,
  ...props
}) => {
  const classes = useStyles();

  return (
    <div
      key={`event-list-item-${e.id}`}
      className={classes.root}
      style={{
        overflow: "hidden",
        width: "100%",
        ...style,
        marginBottom: isLast ? 100 : style?.marginBottom,
      }}
    >
      <Grid
        container
        justifyContent="center"
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <Grid
          item
          md={12}
          lg={10}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            display: "flex",
            height: "100%",
            maxWidth: "100%",
          }}
        >
          <TimelineItem className={classes.wrapper}>
            <TimelineOppositeContent className={classes.oppositeContent}>
              <Typography variant="subtitle1" color="primary">
                {formatDate(e.date)}
              </Typography>
              <TimelineEventSubjects event={e} {...props} />

              <Box className={classes.editButtonBox}>
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
              <TimelineDot
                className={classes.dot}
                variant="outlined"
                color="inherit"
              >
                <EventIcon type={e.type} size="2x" />
              </TimelineDot>
              {!isLast ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent className={classes.content}>
              <EventListItem
                event={e}
                onKeywordClick={onKeywordClick}
                {...props}
              />
            </TimelineContent>
          </TimelineItem>
        </Grid>
      </Grid>
    </div>
  );
};

export default EventTimelineItem;
