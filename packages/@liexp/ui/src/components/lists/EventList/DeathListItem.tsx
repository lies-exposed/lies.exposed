import { Actor, Keyword } from "@liexp/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import * as React from "react";
import { SearchDeathEvent } from "./EventListItem";
import EventListItemBase from "./EventListItemHeader";

interface DeathListItemProps {
  item: SearchDeathEvent;
  onClick?: (e: SearchDeathEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const DeathListItem: React.FC<DeathListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          title={`Death: ${
            item.payload.victim?.fullName ?? item.payload.victim
          }`}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={item.media}
          onKeywordClick={onKeywordClick}
        />
      </Grid>
    </Box>
  );
};
