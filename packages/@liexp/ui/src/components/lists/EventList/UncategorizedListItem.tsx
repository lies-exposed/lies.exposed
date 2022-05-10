import {
  Actor,
  Group,
  GroupMember,
  Keyword,
  Events,
} from "@liexp/shared/io/http";
import { Box, Grid } from "@mui/material";
import * as React from "react";

import EventListItemBase from "./EventListItemBase";

interface UncategorizedListItemProps {
  item: Events.SearchEvent.SearchUncategorizedEvent;
  onClick?: (e: Events.SearchEvent.SearchUncategorizedEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onGroupMemberClick?: (g: GroupMember.GroupMember) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchUncategorizedEvent) => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onRowInvalidate,
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
        width: "100%",
        maxWidth: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2} style={{ width: "100%", maxWidth: "100%" }}>
        <EventListItemBase
          event={item}
          type={Events.Uncategorized.UNCATEGORIZED.value}
          title={item.payload.title}
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
