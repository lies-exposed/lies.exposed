import { groupBy } from "@econnessione/shared/utils/array.utils";
import { distanceFromNow } from "@econnessione/shared/utils/date";
import { makeStyles } from "@material-ui/core";
import Timeline from "@material-ui/lab/Timeline";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItemProps, SearchEvent } from "./EventListItem";
import EventTimelineItem from "./EventTimelineItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: SearchEvent): string => {
    return distanceFromNow(e.date);
  })
);

const useStyles = makeStyles((props) => ({
  timeline: {
    padding: 0,
    width: '100%'
  },
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
  events: SearchEvent[];
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

  return (
    <EventTimelineItem
      key={events[index].id}
      event={events[index]}
      isLast={last}
      {...listItemProps}
    />
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

  const dateHeader = distanceFromNow(events[0].date);
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
    <Timeline
      className={classes.timeline}
      {...props}
      style={{ padding: 0, ...props.style }}
    >
      {orderedEvents.map((ee, i) =>
        renderHeaderRow({
          index: i,
          last: orderedEvents.length - 1 > i,
          data: {
            events: ee,
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
