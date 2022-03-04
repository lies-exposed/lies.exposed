import * as io from "@liexp/shared/io";
import { Events } from '@liexp/shared/io/http';
import { Box, Grid } from "@material-ui/core";
import * as React from "react";
import EventListItemBase from "./EventListItemBase";

interface ScientificStudyListItemProps {
  item: Events.SearchEvent.SearchScientificStudyEvent;
  onClick?: (e: Events.SearchEvent.SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({ item, onClick, onActorClick, onKeywordClick }) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
        maxHeight: 400,
        overflow: "hidden",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          title={item.payload.title}
          url={item.payload.url}
          excerpt={item.excerpt}
          keywords={item.keywords}
          media={item.media}
          links={item.links}
          onKeywordClick={onKeywordClick}
        />
      </Grid>
    </Box>
  );
};
