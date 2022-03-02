import { Actor, Keyword } from "@liexp/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import * as React from "react";
import { SearchDocumentaryEvent } from "./EventListItem";
import EventListItemBase from "./EventListItemBase";

interface DocumentaryListItemProps {
  item: SearchDocumentaryEvent;
  onClick?: (e: SearchDocumentaryEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const DocumentaryListItem: React.FC<DocumentaryListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
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
          title={item.payload.title}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={[item.payload.media]}
          onKeywordClick={onKeywordClick}
        />
      </Grid>
    </Box>
  );
};
