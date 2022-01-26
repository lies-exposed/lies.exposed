import { eventDate } from "@econnessione/shared/helpers/event";
import { Events } from "@econnessione/shared/io/http";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import { distanceFromNow } from "@econnessione/shared/utils/date";
import { makeStyles } from "@material-ui/core";
import Timeline from "@material-ui/lab/Timeline";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItemProps } from "./EventListItem";
import EventTimelineItem from "./EventTimelineItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.Event): string => {
    return distanceFromNow(eventDate(e));
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
    data: { events, ...listItemProps },
  } = props;

  return <EventTimelineItem event={events[index]} isLast={last} {...listItemProps} />;
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

  const dateHeader = distanceFromNow(eventDate(events[0]));
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
  links,
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
            links,
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
