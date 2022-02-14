import { formatDate } from "@econnessione/shared/utils/date";
import { Box, Grid, Link, Typography } from "@material-ui/core";
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

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event: e,
  isLast,
  ...props
}) => {
  return (
    <div
      key={`event-list-item-${e.id}`}
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
          }}
        >
          <TimelineItem style={{ width: "100%" }}>
            <TimelineOppositeContent
              style={{ flex: 0, display: "flex", flexDirection: "column" }}
            >
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
            <TimelineSeparator>
              <TimelineDot variant="outlined" color="inherit">
                <EventIcon type={e.type} />
              </TimelineDot>
              {!isLast ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent style={{ paddingBottom: 20 }}>
              <EventListItem event={e} {...props} />
            </TimelineContent>
          </TimelineItem>
        </Grid>
      </Grid>
    </div>
  );
};

export default EventTimelineItem;
