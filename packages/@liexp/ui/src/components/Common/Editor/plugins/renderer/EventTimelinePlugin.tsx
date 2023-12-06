import { getEventCommonProps } from "@liexp/shared/lib/helpers/event";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import * as React from "react";
import { useEventsQuery } from "../../../../../state/queries/event.queries";
import { styled } from "../../../../../theme";
import QueriesRenderer from "../../../../QueriesRenderer";
import {
  Box,
  Card,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "../../../../mui";
import { EventIcon } from "../../../Icons";

const PREFIX = `event-timeline-plugin`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {},
}));

const EventsTimeline: React.FC<{
  events: Event[];
  onEventClick: (e: Event) => void;
}> = ({ events, onEventClick }) => {
  return (
    <List>
      {events.map((e) => {
        const { title } = getEventCommonProps(e, {
          actors: [],
          groups: [],
          groupsMembers: [],
          keywords: [],
          media: [],
          links: [],
          areas: [],
        });
        return (
          <ListItem
            key={e.id}
            onClick={() => {
              onEventClick(e);
            }}
          >
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
  events: string[];
  onEventClick: (m: Event) => void;
}

export const EventTimelinePlugin: React.FC<EventTimelinePluginProps> = ({
  events,
  onEventClick,
}) => {
  return (
    <StyledBox className={classes.root}>
      <Typography variant="subtitle1">Event timeline</Typography>
      <QueriesRenderer
        queries={{ events: useEventsQuery({ filter: { ids: events } }, true) }}
        render={({ events: { data: events } }) => {
          return <EventsTimeline events={events} onEventClick={onEventClick} />;
        }}
      />
    </StyledBox>
  );
};
