import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { groupBy } from "@econnessione/shared/utils/array.utils";
import {
  List,
  ListItem,
  ListSubheader,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { formatISO } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventListItem } from "./EventListItem";

const byEqualDate = pipe(
  S.Eq,
  Eq.contramap((e: Events.Uncategorized.Uncategorized): string =>
    formatISO(e.startDate, { representation: "date" })
  )
);

const useStyles = makeStyles((props) => ({
  listSubheader: {
    backgroundColor: props.palette.common.white,
  },
}));

export interface EventListProps {
  ref?: React.Ref<HTMLUListElement>;
  className?: string;
  style?: React.CSSProperties;
  events: Events.Event[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  actors,
  groups,
  keywords,
  onClick,
  ...props
}) => {
  const classes = useStyles();
  return (
    <List
      className="events"
      style={{ width: "100%" }}
      subheader={<li />}
      {...props}
    >
      {pipe(
        events,
        A.filter(Events.Uncategorized.Uncategorized.is),
        groupBy(byEqualDate),
        A.map((events) => {
          const dateHeader = formatISO(events[0].startDate, {
            representation: "date",
          });
          return (
            <li key={dateHeader}>
              <ListSubheader className={classes.listSubheader}>
                <Typography variant="h5">{dateHeader}</Typography>
              </ListSubheader>
              <ul>
                {events.map((e) => {
                  const eventActors = Events.Uncategorized.Uncategorized.is(e)
                    ? actors.filter((a) => e.actors.includes(a.id))
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
                        onClick={onClick}
                      />
                    </ListItem>
                  );
                })}
              </ul>
            </li>
          );
        })
      )}
    </List>
  );
};

export default EventList;
