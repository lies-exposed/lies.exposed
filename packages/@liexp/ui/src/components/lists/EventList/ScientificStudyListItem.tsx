import { Events } from "@liexp/shared/lib/io/http/index.js";
import type * as io from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import { Box, Grid } from "../../mui/index.js";
import EventListItemBase from "./EventListItemBase.js";

interface ScientificStudyListItemProps {
  item: Events.SearchEvent.SearchScientificStudyEvent;
  onClick?: (e: Events.SearchEvent.SearchScientificStudyEvent) => void;
  onActorClick?: (e: io.http.Actor.Actor) => void;
  onKeywordClick?: (e: io.http.Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchScientificStudyEvent) => void;
  onLoad?: () => void;
}

export const ScientificStudyListItem: React.FC<
  ScientificStudyListItemProps
> = ({ item, onClick, onActorClick, ...props }) => {
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
          {...props}
          event={item}
          type={Events.EventTypes.SCIENTIFIC_STUDY.Type}
          title={item.payload.title}
          link={item.payload.url}
          excerpt={item.excerpt}
          keywords={item.keywords}
          media={item.media}
          links={item.links}
        />
      </Grid>
    </Box>
  );
};
