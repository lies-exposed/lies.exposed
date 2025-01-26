import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { groupBy } from "@liexp/shared/lib/utils/array.utils.js";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils.js";
import * as Eq from "fp-ts/lib/Eq.js";
import { pipe } from "fp-ts/lib/function.js";
import * as S from "fp-ts/lib/string.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import {
  Grid,
  List,
  ListItem,
  ListSubheader,
  Typography,
} from "../../mui/index.js";
import { EventListItem, type EventListItemProps } from "./EventListItem.js";

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

const RenderHeaderRow: React.FC<{
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
      {orderedEvents.map((ee, i) => (
        <RenderHeaderRow
          index={i}
          data={{
            events: ee,
            classes,
            ...props,
          }}
        />
      ))}
    </List>
  );
};

export default EventList;
