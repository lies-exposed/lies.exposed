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
import { formatISO } from "date-fns";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItem, EventListItemProps } from "./EventListItem";
import { EventIcon } from "@components/Common/Icons/EventIcon";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.EventV2): string => {
    return formatISO(eventDate(e), { representation: "date" });
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
  events: Events.EventV2[];
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

  const eventActors = Events.DeathV2.is(e)
    ? actors.filter((a) => e.payload.victim === a.id)
    : Events.UncategorizedV2.is(e)
    ? actors.filter((a) => e.payload.actors.includes(a.id))
    : [];
  const eventGroups = Events.UncategorizedV2.is(e)
    ? groups.filter((a) => e.payload.groups.includes(a.id))
    : [];
  const eventKeywords = Events.UncategorizedV2.is(e)
    ? keywords.filter((a) => e.payload.keywords.includes(a.id))
    : [];

  const eventGroupMembers = Events.UncategorizedV2.is(e)
    ? groupsMembers.filter((g) => e.payload.groupsMembers.includes(g.id))
    : [];
  const eventMedia = Events.UncategorizedV2.is(e)
    ? media.filter((m) => e.payload.media.includes(m.id))
    : [];

  return (
    <TimelineItem key={`event-list-item-${e.id}`}>
      <TimelineOppositeContent style={{ flex: 0 }}>
        <Typography variant="subtitle1" color="primary">
          {formatISO(
            (e as any).date ?? (e as any).startDate ?? (e as any).publishDate,
            {
              representation: "date",
            }
          )}
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

  const dateHeader = formatISO(eventDate(events[0]), {
    representation: "date",
  });
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
