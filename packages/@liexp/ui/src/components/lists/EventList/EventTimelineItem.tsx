import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import * as React from "react";
import { styled } from "../../../theme";
import EditEventButton from "../../Common/Button/EditEventButton";
import { EventIcon } from "../../Common/Icons/EventIcon";
import { Box, Typography } from "../../mui";
import { EventListItem, type EventListItemProps } from "./EventListItem";
import { TimelineEventSubjects } from "./TimelineEventSubjects";

const PREFIX = "EventTimelineItem";

const classes = {
  root: `${PREFIX}-root`,
  wrapper: `${PREFIX}-wrapper`,
  timelineItem: `${PREFIX}-timelineItem`,
  oppositeContent: `${PREFIX}-oppositeContent`,
  editButtonBox: `${PREFIX}-editButtonBox`,
  separator: `${PREFIX}-separator`,
  dot: `${PREFIX}-dot`,
  content: `${PREFIX}-content`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    overflow: "hidden",
  },

  [`& .${classes.wrapper}`]: {
    display: "flex",
    height: "100%",
    maxWidth: "100%",
    justifyContent: "center",
    flexGrow: 1,
    [theme.breakpoints.up("md")]: {
      maxWidth: "auto",
      flexGrow: 0,
    },
  },

  [`& .${classes.timelineItem}`]: {
    display: "flex",
    width: "100%",
    flexGrow: 0,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.oppositeContent}`]: {
    flexGrow: 0,
    flexShrink: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    maxWidth: "15%",
    margin: 0,
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
      width: "100%",
    },
  },

  [`& .${classes.editButtonBox}`]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    flexGrow: 1,
    [theme.breakpoints.down("md")]: {
      flexGrow: 0,
    },
  },

  [`& .${classes.separator}`]: {
    maxWidth: "10%",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  [`& .${classes.dot}`]: {
    padding: 8,
  },

  [`& .${classes.content}`]: {
    maxWidth: "75%",
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: 20,
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
    },
  },
}));

export interface EventTimelineItemProps extends EventListItemProps {
  ref?: (el: Element | undefined) => void;
  isLast: boolean;
}

// eslint-disable-next-line react/display-name
const EventTimelineItem = React.forwardRef<any, EventTimelineItemProps>(
  (
    { event: e, isLast, style, onKeywordClick, onRowInvalidate, ...props },
    ref,
  ) => {
    return (
      <Root
        key={`event-list-item-${e.id}`}
        ref={ref}
        className={classes.root}
        style={{
          ...style,
          marginBottom: isLast ? 100 : style?.marginBottom,
        }}
      >
        <TimelineItem className={classes.timelineItem}>
          <TimelineOppositeContent className={classes.oppositeContent}>
            <Typography variant="subtitle1" color="primary">
              {formatDate(e.date)}
            </Typography>
            <TimelineEventSubjects event={e} {...props} />

            <Box className={classes.editButtonBox}>
              <EditEventButton id={e.id} />
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
              onRowInvalidate={onRowInvalidate}
              {...props}
            />
          </TimelineContent>
        </TimelineItem>
      </Root>
    );
  },
);

export default EventTimelineItem;
