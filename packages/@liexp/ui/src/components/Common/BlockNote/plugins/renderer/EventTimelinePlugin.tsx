import { getEventCommonProps } from "@liexp/shared/lib/helpers/event/index.js";
import { fromSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { useAPI } from "../../../../../hooks/useAPI.js";
import { searchEventsQuery } from "../../../../../state/queries/SearchEventsQuery.js";
import { styled } from "../../../../../theme/index.js";
import QueriesRenderer from "../../../../QueriesRenderer.js";
import {
  Box,
  Card,
  CardHeader,
  CardMedia,
  List,
  ListItem,
  Stack,
  Typography,
} from "../../../../mui/index.js";
import { EventIcon } from "../../../Icons/index.js";

const PREFIX = `event-timeline-plugin`;

const classes = {
  root: `${PREFIX}-root`,
  list: `${PREFIX}-list`,
  listItem: `${PREFIX}-list-item`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.list}`]: {
    display: "flex",
    flexDirection: "column",
    padding: 0,
  },
  [`& .${classes.listItem}`]: {
    cursor: "pointer",
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const EventsTimeline: React.FC<{
  events: SearchEvent.SearchEvent[];
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}> = ({ events, onEventClick }) => {
  return (
    <List className={classes.list}>
      {events.map((e) => {
        const { title } = getEventCommonProps(fromSearchEvent(e), {
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
            className={classes.listItem}
            key={e.id}
            onClick={() => {
              onEventClick(e);
            }}
          >
            <Card>
              <Stack direction="row" justifyContent={"center"}>
                {e.media[0]?.thumbnail ? (
                  <CardMedia
                    image={e.media[0].thumbnail}
                    title={e.media[0].label}
                    style={{ width: 150 }}
                  />
                ) : null}

                <CardHeader
                  avatar={<EventIcon size="1x" type={e.type} />}
                  title={title}
                  subheader={formatDate(e.date)}
                />
              </Stack>
            </Card>
          </ListItem>
        );
      })}
    </List>
  );
};

interface EventTimelinePluginProps {
  events: string[];
  onEventClick: (m: SearchEvent.SearchEvent) => void;
}

export const EventTimelinePlugin: React.FC<EventTimelinePluginProps> = ({
  events,
  onEventClick,
}) => {
  const api = useAPI();

  if (events.length === 0) {
    return null;
  }

  return (
    <StyledBox className={classes.root}>
      <Typography variant="subtitle1">Event timeline</Typography>
      <QueriesRenderer
        queries={{
          events: searchEventsQuery(api)({
            hash: "event-timeline",
            ids: events,
            _start: 0,
            _end: events.length,
          }),
        }}
        render={({ events: { events } }) => {
          return <EventsTimeline events={events} onEventClick={onEventClick} />;
        }}
      />
    </StyledBox>
  );
};
