import * as io from "@liexp/shared/io";
import { Events } from "@liexp/shared/io/http";
import { Box, Grid } from "@mui/material";
import * as React from "react";
import EventListItemBase from "./EventListItemBase";

interface ScientificStudyListItemProps {
  item: Events.SearchEvent.SearchScientificStudyEvent;
  onClick?: (e: Events.SearchEvent.SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchScientificStudyEvent) => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({ item, onClick, onActorClick, onKeywordClick, onRowInvalidate }) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2}>
        <EventListItemBase
          event={item}
          type={Events.ScientificStudy.SCIENTIFIC_STUDY.value}
          title={item.payload.title}
          url={item.payload.url}
          excerpt={item.excerpt}
          keywords={item.keywords}
          media={item.media}
          links={item.links}
          onKeywordClick={onKeywordClick}
          onRowInvalidate={onRowInvalidate}
        />
      </Grid>
    </Box>
  );
};
