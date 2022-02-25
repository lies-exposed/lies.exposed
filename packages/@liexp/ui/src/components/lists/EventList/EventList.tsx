import { groupBy } from "@liexp/shared/utils/array.utils";
import { distanceFromNow } from "@liexp/shared/utils/date";
import {
  Grid,
  List,
  ListItem,
  ListSubheader,
  makeStyles,
  Typography
} from "@material-ui/core";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItem, EventListItemProps, SearchEvent } from "./EventListItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: SearchEvent): string => {
    return distanceFromNow(e.date);
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
  events: SearchEvent[];
}

const renderRow = (props: {
  index: number;
  data: EventListProps;
}): React.ReactElement => {
  const {
    index,
    data: { events, ...listItemProps },
  } = props;

  const e = events[index];

  return (
    <ListItem key={`event-list-item-${e.id}`}>
      <EventListItem event={e} {...listItemProps} />
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

  const dateHeader = distanceFromNow(events[0].date);
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
