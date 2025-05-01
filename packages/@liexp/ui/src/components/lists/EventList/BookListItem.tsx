import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  type Events,
  type Keyword,
  type Actor,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Box, Grid } from "../../mui/index.js";
import EventListItemBase from "./EventListItemBase.js";

export interface BookListItemProps {
  item: Events.SearchEvent.SearchBookEvent;
  onClick?: (e: Events.SearchEvent.SearchBookEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchBookEvent) => void;
  onLoad?: () => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  item,
  onClick,
  ...props
}) => {
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
          title={item.payload.title}
          type={EVENT_TYPES.DEATH}
          excerpt={item.excerpt}
          keywords={item.keywords}
          links={item.links}
          media={item.media}
          mediaDescription={false}
          disableMediaAction={true}
        />
      </Grid>
    </Box>
  );
};
