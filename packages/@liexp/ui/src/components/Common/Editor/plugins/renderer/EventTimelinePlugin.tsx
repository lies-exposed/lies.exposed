import { fp } from "@liexp/core/lib/fp";
import { getEventCommonProps } from "@liexp/shared/lib/helpers/event";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { formatDate } from "@liexp/shared/lib/utils/date";
import { type Cell, type Value } from "@react-page/editor";
import { type Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { styled } from "../../../../../theme";
import {
  Box,
  Card,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "../../../../mui";
import { EventIcon } from "../../../Icons";
import { transform } from "../../deserialize";
import { EVENT_BLOCK_PLUGIN_ID } from "../event/eventBlock.plugin";

const deserializeCell = (c: Cell): Option<Event[]> => {
  if (c.plugin?.id === EVENT_BLOCK_PLUGIN_ID) {
    const events: any[] = c.dataI18n?.en?.event as any[];

    return pipe(
      events,
      fp.O.fromPredicate((ee) => ee.length > 0)
    );
  }

  return pipe(
    transform({ rows: c.rows ?? [] } as any, deserializeCell),
    fp.O.fromNullable
  );
};

const serializeEventIds = (value: Value): Event[] => {
  const defaultIds: Event[] = [];
  return pipe(
    transform(value, deserializeCell),
    fp.O.fromNullable,
    fp.O.getOrElse(() => defaultIds)
  );
};

const PREFIX = `event-timeline-plugin`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {},
}));

const EventsTimeline: React.FC<{ events: Event[] }> = ({ events }) => {
  return (
    <List>
      {events.map((e) => {
        const { title } = getEventCommonProps(e, {
          actors: [],
          groups: [],
          groupsMembers: [],
          keywords: [],
          media: [],
        });
        return (
          <ListItem key={e.id}>
            <Card>
              <CardHeader
                avatar={<EventIcon size="2x" type={e.type} />}
                title={title}
                subheader={formatDate(e.date)}
              />
            </Card>
          </ListItem>
        );
      })}
    </List>
  );
};

interface EventTimelinePluginProps {
  value: Value;
}

export const EventTimelinePlugin: React.FC<EventTimelinePluginProps> = ({
  value,
}) => {
  const events = React.useMemo(() => pipe(serializeEventIds(value)), [value]);

  return (
    <StyledBox className={classes.root}>
      <Typography variant="subtitle1">Event timeline</Typography>
      <EventsTimeline events={events} />
    </StyledBox>
  );
};
