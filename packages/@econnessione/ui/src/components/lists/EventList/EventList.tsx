import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Event } from "@econnessione/shared/io/http/Events";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import {
  List,
  ListItem,
  ListSubheader,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { formatISO } from "date-fns";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItem } from "./EventListItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.Event): string => {
    if (Events.Uncategorized.Uncategorized.is(e)) {
      return formatISO(e.startDate, { representation: "date" });
    }
    return formatISO(e.date, { representation: "date" });
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

const renderRow = (props: {
  index: number;
  data: {
    events: Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
  };
}): React.ReactElement => {
  const {
    index,
    data: { events, actors, groups, keywords },
  } = props;

  const e = events[index];

  const eventActors = Events.Uncategorized.Uncategorized.is(e)
    ? actors.filter((a) => e.actors.includes(a.id))
    : Events.Death.Death.is(e)
    ? actors.filter((a) => e.victim === a.id)
    : [];
  const eventGroups = Events.Uncategorized.Uncategorized.is(e)
    ? groups.filter((a) => e.groups.includes(a.id))
    : [];
  const eventKeywords = Events.Uncategorized.Uncategorized.is(e)
    ? keywords.filter((a) => e.keywords.includes(a.id))
    : [];

  return (
    <ListItem key={`event-list-item-${e.id}`}>
      <EventListItem
        event={e}
        actors={eventActors}
        groups={eventGroups}
        keywords={eventKeywords}
        onClick={() => {}}
      />
    </ListItem>
  );
};

const renderHeaderRow: React.FC<{
  index: number;
  data: {
    events: Event[];
    actors: Actor.Actor[];
    groups: Group.Group[];
    keywords: Keyword.Keyword[];
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

  const dateHeader = formatISO(
    Events.Uncategorized.Uncategorized.is(events[0])
      ? events[0].startDate
      : events[0].date,
    {
      representation: "date",
    }
  );
  return (
    <div key={dateHeader}>
      <ListSubheader className={classes.listSubheader}>
        <Typography variant="h5">{dateHeader}</Typography>
      </ListSubheader>
      <List className={classes.listItemUList}>
        {events.map((e, i) =>
          renderRow({
            data: { ...data, events },
            index: i,
          })
        )}
      </List>
    </div>
  );
};

export interface EventListProps {
  className?: string;
  style?: React.CSSProperties;
  events: Events.Event[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick: (e: Events.Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  actors,
  groups,
  keywords,
  onClick,
  ...props
}) => {
  const events = pipe(props.events, groupBy(byEqualDate));
  const classes = useStyles();
  return (
    <List className="events" subheader={<div />} {...props}>
      {events.map((e, i) =>
        renderHeaderRow({
          index: i,
          data: {
            events: e,
            actors,
            groups,
            keywords,
            classes,
          },
        })
      )}
    </List>
  );
};

export default EventList;
