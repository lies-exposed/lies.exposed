import { eventDate } from "@econnessione/shared/helpers/event";
import { Events } from "@econnessione/shared/io/http";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import { makeStyles, Typography } from "@material-ui/core";
import Timeline from "@material-ui/lab/Timeline";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import { format } from "date-fns";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventIcon } from "../../Common/Icons/EventIcon";
import { EventListItem, EventListItemProps } from "./EventListItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.Event): string => {
    return format(eventDate(e));
  })
);

const useStyles = makeStyles((props) => ({
  listSubheader: {
    backgroundColor: props.palette.common.white,
  },
  listItemUList: {
    padding: 0,
    width: "100%",
  },
}));

export interface EventListProps extends Omit<EventListItemProps, "event"> {
  className?: string;
  style?: React.CSSProperties;
  events: Events.Event[];
}

const renderRow = (props: {
  index: number;
  last: boolean;
  data: EventListProps;
}): React.ReactElement => {
  const {
    index,
    last,
    data: {
      events,
      actors,
      groups,
      groupsMembers,
      keywords,
      media,
      ...listItemProps
    },
  } = props;

  const e = events[index];

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

  const eventKeywords = keywords.filter((a) => e.keywords.includes(a.id));

  return (
    <TimelineItem key={`event-list-item-${e.id}`}>
      <TimelineOppositeContent style={{ flex: 0 }}>
        <Typography variant="subtitle1" color="primary">
          {format(e.date)}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot variant="outlined" color="inherit">
          <EventIcon type={e.type} color="secondary" />
        </TimelineDot>
        {last ? <TimelineConnector /> : null}
      </TimelineSeparator>
      <TimelineContent style={{ maxWidth: "100%" }}>
        <EventListItem
          event={e}
          actors={eventActors}
          groups={eventGroups}
          keywords={eventKeywords}
          groupsMembers={eventGroupMembers}
          media={eventMedia}
          {...listItemProps}
        />
      </TimelineContent>
    </TimelineItem>
  );
};

const renderHeaderRow: React.FC<{
  index: number;
  last: boolean;
  data: EventListProps & {
    classes: {
      listItemUList: string;
      listSubheader: string;
    };
  };
}> = (props) => {
  const {
    data: { classes, ...data },
  } = props;
  const events = data.events;

  const dateHeader = format(eventDate(events[0]));
  return (
    <div key={dateHeader}>
      {events.map((e, i) =>
        renderRow({
          data: { ...data, events },
          index: i,
          last: props.last,
        })
      )}
    </div>
  );
};

const EventsTimeline: React.FC<EventListProps> = ({
  events,
  actors,
  groups,
  keywords,
  groupsMembers,
  media,
  onClick,
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onGroupMemberClick,
  ...props
}) => {
  const orderedEvents = React.useMemo(
    () => pipe(events, groupBy(byEqualDate)),
    [events]
  );

  const classes = useStyles();
  return (
    <Timeline className="events" {...props}>
      {orderedEvents.map((ee, i) =>
        renderHeaderRow({
          index: i,
          last: orderedEvents.length - 1 > i,
          data: {
            events: ee,
            actors,
            groups,
            groupsMembers,
            keywords,
            media,
            classes,
            onClick,
            onActorClick,
            onGroupClick,
            onGroupMemberClick,
            onKeywordClick,
          },
        })
      )}
    </Timeline>
  );
};

export default EventsTimeline;
