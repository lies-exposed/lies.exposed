import { type Actor, Events, type Keyword } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Box, Grid } from "../../mui/index.js";
import EventListItemBase from "./EventListItemBase.js";

interface DocumentaryListItemProps {
  item: Events.SearchEvent.SearchDocumentaryEvent;
  condensed?: boolean;
  onClick?: (e: Events.SearchEvent.SearchDocumentaryEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchDocumentaryEvent) => void;
  onLoad?: () => void;
}

export const DocumentaryListItem: React.FC<DocumentaryListItemProps> = ({
  item,
  onClick,
  onActorClick,
  ...props
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        display: "flex",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          event={item}
          type={Events.EventTypes.DOCUMENTARY.value}
          title={item.payload.title}
          link={item.payload.website}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={[item.payload.media]}
          {...props}
        />
      </Grid>
    </Box>
  );
};
