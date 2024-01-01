import { Events, type Keyword, type Actor } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { Box, Grid } from "../../mui";
import EventListItemBase from "./EventListItemBase";

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
          type={Events.EventTypes.DEATH.value}
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
