import { type Events } from "@liexp/shared/lib/io/http";
import { groupBy } from "@liexp/shared/lib/utils/array.utils";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils";
import * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as React from "react";
import { styled } from "../../../theme";
import { Grid, List, ListItem, ListSubheader, Typography } from "../../mui";
import { EventListItem, type EventListItemProps } from "./EventListItem";

const PREFIX = "EventList";

const classes = {
  listSubheader: `${PREFIX}-listSubheader`,
  listItemUList: `${PREFIX}-listItemUList`,
};

const StyledList = styled(List)(({ theme }) => ({
  [`& .${classes.listSubheader}`]: {
    backgroundColor: theme.palette.common.white,
  },

  [`&.${classes.listItemUList}`]: {
    padding: 0,
    width: "100%",
  },
}));

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.SearchEvent.SearchEvent): string => {
    return distanceFromNow(e.date);
  }),
);

export interface EventListProps extends Omit<EventListItemProps, "event"> {
  className?: string;
  style?: React.CSSProperties;
  events: Events.SearchEvent.SearchEvent[];
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
    data: { ...data },
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
      <StyledList className={classes.listItemUList}>
        {events.map((e, i) =>
          renderRow({
            data: { ...data, events },
            index: i,
          }),
        )}
      </StyledList>
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
        }),
      )}
    </List>
  );
};

export default EventList;
