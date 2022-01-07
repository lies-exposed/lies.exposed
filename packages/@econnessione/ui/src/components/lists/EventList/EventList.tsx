import { eventDate } from "@econnessione/shared/helpers/event";
import { Events } from "@econnessione/shared/io/http";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import {
  Grid,
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
import { EventListItem, EventListItemProps } from "./EventListItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.Event): string => {
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
  events: Events.Event[];
}

const renderRow = (props: {
  index: number;
  data: EventListProps;
}): React.ReactElement => {
  const {
    index,
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
  const eventKeywords = Events.Uncategorized.Uncategorized.is(e)
    ? keywords.filter((a) => e.keywords.includes(a.id))
    : [];

  const eventGroupMembers = Events.Uncategorized.Uncategorized.is(e)
    ? groupsMembers.filter((g) => e.payload.groupsMembers.includes(g.id))
    : [];
  const eventMedia = Events.Uncategorized.Uncategorized.is(e)
    ? media.filter((m) => e.media.includes(m.id))
    : [];

  return (
    <ListItem key={`event-list-item-${e.id}`}>
      <EventListItem
        event={e}
        actors={eventActors}
        groups={eventGroups}
        keywords={eventKeywords}
        groupsMembers={eventGroupMembers}
        media={eventMedia}
        {...listItemProps}
      />
    </ListItem>
  );
};

const renderHeaderRow: React.FC<{
  index: number;
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
      <ListSubheader className={classes.listSubheader}>
        <Grid container>
          <Grid item md={10}>
            <Typography variant="h5" color="primary">
              {dateHeader}
            </Typography>
          </Grid>
          <Grid
            item
            md={2}
            style={{
              textAlign: "right",
            }}
          >
            <Typography variant="h6">{data.events.length}</Typography>
          </Grid>
        </Grid>
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

const EventList: React.FC<EventListProps> = ({
  events,
  className,
  style,
  ...props
}) => {
  const orderedEvents = pipe(events, groupBy(byEqualDate));
  const classes = useStyles();
  return (
    <List className={`events ${className}`} subheader={<div />} style={style}>
      {orderedEvents.map((ee, i) =>
        renderHeaderRow({
          index: i,
          data: {
            events: ee,
            classes,
            ...props,
          },
        })
      )}
    </List>
  );
};

export default EventList;
