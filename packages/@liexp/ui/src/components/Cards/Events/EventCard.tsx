import { SearchEvent } from "@liexp/shared/io/http/Events";
import { Box } from "@material-ui/core";
import * as React from "react";
import { Avatar } from "../../Common/Avatar";
import EventListItemBase from "../../lists/EventList/EventListItemBase";

interface EventCardProps {
  event: SearchEvent.SearchEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event, ...props }) => {
  switch (event.type) {
    case "Death":
      return (
        <Box>
          Death {event.payload.victim?.fullName}
          {event.payload.victim ? (
            <Avatar src={event.payload.victim.avatar} />
          ) : null}
        </Box>
      );
    default:
      return (
        <Box>
          <EventListItemBase
            title={event.payload.title}
            excerpt={event.excerpt}
            media={event.media}
            links={[]}
            keywords={event.keywords}
            onKeywordClick={() => undefined}
          />
        </Box>
      );
  }
};

export default EventCard;
