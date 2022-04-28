import { formatDate } from "@liexp/shared/utils/date";
import { Box, Grid, makeStyles, Typography } from "@material-ui/core";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from "@material-ui/lab";
import * as React from "react";
import EditButton from '../../Common/Button/EditButton';
import { EventIcon } from "../../Common/Icons/EventIcon";
import { EventListItem, EventListItemProps } from "./EventListItem";
import { TimelineEventSubjects } from "./TimelineEventSubjects";

export interface EventTimelineItemProps extends EventListItemProps {
  ref?: (el: Element | undefined) => void;
  isLast: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
  },
  wrapper: {
    display: "flex",
    height: "100%",
    maxWidth: "100%",
    justifyContent: "center",
    flexGrow: 1,
  },
  timelineItem: {
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
  ref,
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
      ref={ref as any}
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
        <Grid item lg={2} md={1} sm={false} xs={false} />
        <Grid className={classes.wrapper} item sm={12} md={10} lg={8}>
          <TimelineItem className={classes.timelineItem}>
            <TimelineOppositeContent className={classes.oppositeContent}>
              <Typography variant="subtitle1" color="primary">
                {formatDate(e.date)}
              </Typography>
              <TimelineEventSubjects event={e} {...props} />

              <Box className={classes.editButtonBox}>
                <EditButton resourceName='events' resource={{ id: e.id }} />
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
        <Grid item lg={2} md={1} sm={false} xs={false} />
      </Grid>
    </div>
  );
};

export default EventTimelineItem;
