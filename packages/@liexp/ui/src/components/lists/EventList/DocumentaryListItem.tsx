import { Actor, Events, Keyword } from "@liexp/shared/io/http";
import { Box, Grid } from "@mui/material";
import * as React from "react";
import EventListItemBase from "./EventListItemBase";

interface DocumentaryListItemProps {
  item: Events.SearchEvent.SearchDocumentaryEvent;
  onClick?: (e: Events.SearchEvent.SearchDocumentaryEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchDocumentaryEvent) => void;
}

export const DocumentaryListItem: React.FC<DocumentaryListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
  onRowInvalidate,
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

  return (
    <Box
      id={item.id}
      style={{
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          event={item}
          type={Events.Documentary.DOCUMENTARY.value}
          title={item.payload.title}
          url={item.payload.website}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={[item.payload.media]}
          onKeywordClick={onKeywordClick}
          onRowInvalidate={onRowInvalidate}
        />
      </Grid>
    </Box>
  );
};
