import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  type Actor,
  type Keyword,
  type Events,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Box, Grid } from "../../mui/index.js";
import EventListItemBase from "./EventListItemBase.js";

interface DeathListItemProps {
  item: Events.SearchEvent.SearchDeathEvent;
  onClick?: (e: Events.SearchEvent.SearchDeathEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchDeathEvent) => void;
  onLoad?: () => void;
}

export const DeathListItem: React.FC<DeathListItemProps> = ({
  item,
  onClick,
  onActorClick,
  ...props
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

  return (
    <Box
      id={item.id}
      style={{
        width: "100%",
        display: "flex",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          {...props}
          event={item}
          title={`Death: ${
            item.payload.victim?.fullName ?? item.payload.victim
          }`}
          type={EVENT_TYPES.DEATH}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={item.media}
        />
      </Grid>
    </Box>
  );
};
