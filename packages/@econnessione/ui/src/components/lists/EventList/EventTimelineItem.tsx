import { formatDate } from "@econnessione/shared/utils/date";
import { Link, Typography } from "@material-ui/core";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator
} from "@material-ui/lab";
import * as React from "react";
import { EventIcon } from "../../Common/Icons/EventIcon";
import { EventListItem, EventListItemProps } from "./EventListItem";
import { TimelineEventSubjects } from "./TimelineEventSubjects";

interface EventTimelineItemProps extends EventListItemProps {
  isLast: boolean;
}

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event: e,
  isLast,
  ...props
}) => {
  return (
    <TimelineItem key={`event-list-item-${e.id}`}>
      <TimelineOppositeContent style={{ flex: 0 }}>
        <Typography variant="subtitle1" color="primary">
          {formatDate(e.date)}
        </Typography>
        <TimelineEventSubjects event={e} {...props} />
        {process.env.NODE_ENV === "development" ? (
          <Link
            href={`${process.env.ADMIN_URL}/index.html?#events/${e.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Edit
          </Link>
        ) : null}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot variant="outlined" color="inherit">
          <EventIcon type={e.type} />
        </TimelineDot>
        {isLast ? <TimelineConnector /> : null}
      </TimelineSeparator>
      <TimelineContent style={{ maxWidth: "100%", paddingBottom: 20 }}>
        <EventListItem event={e} {...props} />
      </TimelineContent>
    </TimelineItem>
  );
};

export default EventTimelineItem;
