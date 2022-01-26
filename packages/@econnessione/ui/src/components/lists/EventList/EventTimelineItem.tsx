import { Events } from "@econnessione/shared/io/http";
import { formatDate } from "@econnessione/shared/utils/date";
import { Typography } from "@material-ui/core";
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

interface EventTimelineItemProps extends EventListItemProps {
  isLast: boolean;
}

const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event: e,
  actors,
  groups,
  groupsMembers,
  media,
  links,
  keywords,
  isLast,
  ...props
}) => {
  const eventActors = Events.Death.Death.is(e)
    ? actors.filter((a) => e.payload.victim === a.id)
    : Events.Uncategorized.Uncategorized.is(e)
    ? actors.filter((a) => e.payload.actors.includes(a.id))
    : [];
  const eventGroups = Events.Uncategorized.Uncategorized.is(e)
    ? groups.filter((a) => e.payload.groups.includes(a.id))
    : [];
  const eventGroupMembers = Events.Uncategorized.Uncategorized.is(e)
    ? groupsMembers.filter((g) => e.payload.groupsMembers.includes(g.id))
    : [];

  const eventMedia = media.filter((m) => e.media.includes(m.id));
  const eventLinks = links.filter((l) => e.links.includes(l.id));
  const eventKeywords = keywords.filter((a) => e.keywords.includes(a.id));

  return (
    <TimelineItem key={`event-list-item-${e.id}`}>
      <TimelineOppositeContent style={{ flex: 0 }}>
        <Typography variant="subtitle1" color="primary">
          {formatDate(e.date)}
        </Typography>
        <TimelineEventSubjects
          event={e}
          actors={eventActors}
          groups={eventGroups}
          groupsMembers={eventGroupMembers}
        />
        {process.env.NODE_ENV === "development" ? (
          <a
            href={`${process.env.ADMIN_URL}/index.html?#events/${e.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Edit
          </a>
        ) : null}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot variant="outlined" color="inherit">
          <EventIcon type={e.type} color="secondary" />
        </TimelineDot>
        {isLast ? <TimelineConnector /> : null}
      </TimelineSeparator>
      <TimelineContent style={{ maxWidth: "100%", paddingBottom: 20 }}>
        <EventListItem
          event={e}
          actors={eventActors}
          groups={eventGroups}
          keywords={eventKeywords}
          groupsMembers={eventGroupMembers}
          media={eventMedia}
          links={eventLinks}
          {...props}
        />
      </TimelineContent>
    </TimelineItem>
  );
};

export default EventTimelineItem;
